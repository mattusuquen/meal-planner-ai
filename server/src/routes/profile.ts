import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma";

export const profileRouter = Router();

profileRouter.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const profile = await prisma.user_profiles.findUnique({ where: { user_id: userId } });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json({
      userId: profile.user_id,
      goal: profile.goal,
      dietType: profile.diet_type,
      activityLevel: profile.activity_level,
      weightLbs: profile.weight_lbs,
      heightInches: profile.height_inches,
      age: profile.age,
      gender: profile.gender,
      restrictions: profile.restrictions,
      cuisines: profile.cuisines,
      mealsPerDay: profile.meals_per_day,
      cookingSkill: profile.cooking_skill,
      budget: profile.budget,
      updatedAt: profile.updated_at,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

profileRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const {
      goal,
      dietType,
      activityLevel,
      weightLbs,
      heightInches,
      age,
      gender,
      restrictions,
      cuisines,
      mealsPerDay,
      cookingSkill,
      budget,
    } = profileData;

    if (!goal || !dietType || !activityLevel || !weightLbs || !heightInches || !age || !cookingSkill || !budget) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: {
        goal,
        diet_type: dietType,
        activity_level: activityLevel,
        weight_lbs: Number(weightLbs),
        height_inches: Number(heightInches),
        age: Number(age),
        gender: gender || null,
        restrictions: restrictions || null,
        cuisines: cuisines || null,
        meals_per_day: Number(mealsPerDay) || 3,
        cooking_skill: cookingSkill,
        budget,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        goal,
        diet_type: dietType,
        activity_level: activityLevel,
        weight_lbs: Number(weightLbs),
        height_inches: Number(heightInches),
        age: Number(age),
        gender: gender || null,
        restrictions: restrictions || null,
        cuisines: cuisines || null,
        meals_per_day: Number(mealsPerDay) || 3,
        cooking_skill: cookingSkill,
        budget,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});
