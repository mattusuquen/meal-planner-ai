import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";
import { generateMealPlan, regenerateSingleMeal } from "../lib/ai";

export const planRouter = Router();

planRouter.post("/generate", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res
        .status(400)
        .json({ error: "User profile not found. Complete onboarding first." });
    }

    const latestPlan = await prisma.meal_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      select: { version: true },
    });

    const nextVersion = latestPlan ? latestPlan.version + 1 : 1;
    let planJson;

    try {
      planJson = await generateMealPlan(profile);
    } catch (error) {
      console.error("AI generation failed:", error);
      return res.status(500).json({
        error: "Failed to generate meal plan. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    const planText = JSON.stringify(planJson, null, 2);

    const newPlan = await prisma.meal_plans.create({
      data: {
        user_id: userId,
        plan_json: planJson as any,
        plan_text: planText,
        version: nextVersion,
      },
    });

    res.json({
      id: newPlan.id,
      version: newPlan.version,
      createdAt: newPlan.created_at,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

planRouter.post("/refresh-meal", async (req: Request, res: Response) => {
  try {
    const { userId, day, mealType, currentMealName } = req.body;
    if (!userId || !day || !mealType) {
      return res.status(400).json({ error: "userId, day, and mealType are required" });
    }

    const [profile, plan] = await Promise.all([
      prisma.user_profiles.findUnique({ where: { user_id: userId } }),
      prisma.meal_plans.findFirst({ where: { user_id: userId }, orderBy: { created_at: "desc" } }),
    ]);

    if (!profile) return res.status(400).json({ error: "Profile not found" });
    if (!plan) return res.status(404).json({ error: "No plan found" });

    const newMeal = await regenerateSingleMeal(profile, day, mealType, currentMealName || "");

    // Patch the plan JSON in place
    const planJson = plan.plan_json as any;
    const dayEntry = planJson.weeklySchedule?.find((d: any) => d.day === day);
    if (dayEntry) {
      const mealIndex = dayEntry.meals.findIndex((m: any) => m.type === mealType);
      if (mealIndex !== -1) {
        dayEntry.meals[mealIndex] = newMeal;
      } else {
        dayEntry.meals.push(newMeal);
      }
      // Recalculate day total calories
      dayEntry.totalCalories = dayEntry.meals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
    }

    await prisma.meal_plans.update({
      where: { id: plan.id },
      data: { plan_json: planJson, plan_text: JSON.stringify(planJson, null, 2) },
    });

    res.json({ meal: newMeal, day, updatedTotalCalories: dayEntry?.totalCalories });
  } catch (error) {
    console.error("Error refreshing meal:", error);
    res.status(500).json({ error: "Failed to refresh meal" });
  }
});

planRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const plan = await prisma.meal_plans.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    if (!plan) {
      return res.status(404).json({ error: "No plan found" });
    }

    res.json({
      id: plan.id,
      userId: plan.user_id,
      planJson: plan.plan_json,
      version: plan.version,
      createdAt: plan.created_at,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});
