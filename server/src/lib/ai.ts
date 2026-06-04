import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export interface MealPlanResult {
  overview: {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes: string;
  };
  weeklySchedule: Array<{
    day: string;
    totalCalories: number;
    meals: Array<{
      type: string;
      name: string;
      calories: number;
      prepTime: string;
      cookTime: string;
      servings: number;
      ingredients: Array<{ name: string; amount: string }>;
      instructions: string[];
      nutrition: { protein: number; carbs: number; fat: number };
    }>;
  }>;
  groceryList: Array<{
    category: string;
    items: Array<{ name: string; amount: string; usedIn: string[] }>;
  }>;
}

export async function generateMealPlan(
  profile: Record<string, any>
): Promise<MealPlanResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const openai = new OpenAI({ apiKey });

  const prompt = buildPrompt(profile);

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert registered dietitian and meal planning specialist. You must respond with valid JSON only. No markdown, no extra text.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content in AI response");

  const parsed = JSON.parse(content);
  return formatResponse(parsed, profile);
}

function buildPrompt(profile: Record<string, any>): string {
  const goalMap: Record<string, string> = {
    lose_weight: "lose weight and reduce body fat",
    maintain: "maintain current weight and eat balanced meals",
    gain_weight: "gain weight and build mass with healthy foods",
    eat_healthier: "eat healthier with nutritious whole foods",
    build_muscle: "build muscle with high-protein meals",
  };

  const activityMap: Record<string, string> = {
    sedentary: "sedentary (desk job, little exercise)",
    light: "lightly active (1-3 days/week exercise)",
    moderate: "moderately active (3-5 days/week exercise)",
    active: "very active (6-7 days/week exercise)",
    very_active: "extremely active (physical job + daily exercise)",
  };

  const dietMap: Record<string, string> = {
    omnivore: "omnivore (eats everything)",
    vegetarian: "vegetarian (no meat, may eat dairy/eggs)",
    vegan: "vegan (no animal products)",
    keto: "ketogenic (very low carb, high fat)",
    paleo: "paleo (whole foods, no grains/legumes/dairy)",
    mediterranean: "mediterranean (fish, olive oil, vegetables, whole grains)",
  };

  const skillMap: Record<string, string> = {
    beginner: "beginner cook (simple, quick recipes under 30 min)",
    intermediate: "intermediate cook (moderate complexity, up to 45 min)",
    advanced: "advanced cook (complex techniques acceptable)",
  };

  const budgetMap: Record<string, string> = {
    low: "tight budget (under $75/week, use affordable staples)",
    medium: "moderate budget ($75-150/week, balance quality and cost)",
    high: "flexible budget ($150+/week, can use premium ingredients)",
  };

  // Calculate rough TDEE
  const weightKg = profile.weight_lbs * 0.453592;
  const heightCm = profile.height_inches * 2.54;
  const age = profile.age;
  const isMale = profile.gender !== "female";
  const bmr = isMale
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[profile.activity_level] || 1.55));

  const goalCalAdjust: Record<string, number> = {
    lose_weight: -500,
    maintain: 0,
    gain_weight: 300,
    eat_healthier: 0,
    build_muscle: 250,
  };

  const targetCalories = tdee + (goalCalAdjust[profile.goal] || 0);
  const mealsPerDay = profile.meals_per_day || 3;

  return `Create a complete 7-day meal plan for someone with the following profile:

Goal: ${goalMap[profile.goal] || profile.goal}
Diet Type: ${dietMap[profile.diet_type] || profile.diet_type}
Activity Level: ${activityMap[profile.activity_level] || profile.activity_level}
Weight: ${profile.weight_lbs} lbs | Height: ${profile.height_inches} inches | Age: ${profile.age}
Target Daily Calories: ~${targetCalories} calories
Meals Per Day: ${mealsPerDay} (${mealsPerDay === 3 ? "breakfast, lunch, dinner" : mealsPerDay === 4 ? "breakfast, lunch, dinner, snack" : "breakfast, morning snack, lunch, afternoon snack, dinner"})
Cooking Skill: ${skillMap[profile.cooking_skill] || profile.cooking_skill}
Budget: ${budgetMap[profile.budget] || profile.budget}
${profile.restrictions ? `Food Restrictions/Allergies: ${profile.restrictions}` : ""}
${profile.cuisines ? `Preferred Cuisines: ${profile.cuisines}` : ""}

IMPORTANT REQUIREMENTS:
1. Reuse ingredients across multiple days to minimize waste and grocery cost
2. Each recipe must include exact ingredient amounts, step-by-step instructions
3. Keep recipes appropriate for the cooking skill level
4. The grocery list must consolidate ALL ingredients from all 7 days, grouped by category, noting which meals each item is used in
5. Vary the meals so each day is different

Return ONLY this JSON structure (no markdown):
{
  "overview": {
    "dailyCalories": ${targetCalories},
    "protein": <grams>,
    "carbs": <grams>,
    "fat": <grams>,
    "notes": "<2-3 sentences about the meal plan approach>"
  },
  "weeklySchedule": [
    {
      "day": "Monday",
      "totalCalories": <number>,
      "meals": [
        {
          "type": "breakfast",
          "name": "<recipe name>",
          "calories": <number>,
          "prepTime": "<X min>",
          "cookTime": "<X min>",
          "servings": 1,
          "ingredients": [
            { "name": "<ingredient>", "amount": "<amount>" }
          ],
          "instructions": ["<step 1>", "<step 2>"],
          "nutrition": { "protein": <g>, "carbs": <g>, "fat": <g> }
        }
      ]
    }
  ],
  "groceryList": [
    {
      "category": "Produce",
      "items": [
        { "name": "<item>", "amount": "<total amount>", "usedIn": ["Monday Breakfast", "Wednesday Lunch"] }
      ]
    }
  ]
}

Categories for groceryList: "Produce", "Proteins", "Dairy & Eggs", "Grains & Bread", "Canned & Dry Goods", "Oils, Sauces & Condiments", "Frozen", "Other"

Return ONLY the JSON object.`;
}

function formatResponse(ai: any, profile: Record<string, any>): MealPlanResult {
  const weightKg = profile.weight_lbs * 0.453592;
  const heightCm = profile.height_inches * 2.54;
  const age = profile.age;
  const isMale = profile.gender !== "female";
  const bmr = isMale
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const goalCalAdjust: Record<string, number> = {
    lose_weight: -500, maintain: 0, gain_weight: 300, eat_healthier: 0, build_muscle: 250,
  };
  const tdee = Math.round(bmr * (activityMultipliers[profile.activity_level] || 1.55));
  const targetCalories = tdee + (goalCalAdjust[profile.goal] || 0);

  return {
    overview: {
      dailyCalories: ai.overview?.dailyCalories || targetCalories,
      protein: ai.overview?.protein || Math.round(targetCalories * 0.25 / 4),
      carbs: ai.overview?.carbs || Math.round(targetCalories * 0.45 / 4),
      fat: ai.overview?.fat || Math.round(targetCalories * 0.30 / 9),
      notes: ai.overview?.notes || "Follow this plan consistently and stay hydrated throughout the day.",
    },
    weeklySchedule: (ai.weeklySchedule || []).map((day: any) => ({
      day: day.day || "Day",
      totalCalories: day.totalCalories || targetCalories,
      meals: (day.meals || []).map((meal: any) => ({
        type: meal.type || "meal",
        name: meal.name || "Recipe",
        calories: meal.calories || 400,
        prepTime: meal.prepTime || "10 min",
        cookTime: meal.cookTime || "15 min",
        servings: meal.servings || 1,
        ingredients: (meal.ingredients || []).map((ing: any) => ({
          name: ing.name || "",
          amount: ing.amount || "",
        })),
        instructions: meal.instructions || [],
        nutrition: {
          protein: meal.nutrition?.protein || 0,
          carbs: meal.nutrition?.carbs || 0,
          fat: meal.nutrition?.fat || 0,
        },
      })),
    })),
    groceryList: (ai.groceryList || []).map((cat: any) => ({
      category: cat.category || "Other",
      items: (cat.items || []).map((item: any) => ({
        name: item.name || "",
        amount: item.amount || "",
        usedIn: item.usedIn || [],
      })),
    })),
  };
}
