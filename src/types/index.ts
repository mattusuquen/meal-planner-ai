export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  goal: "lose_weight" | "maintain" | "gain_weight" | "eat_healthier" | "build_muscle";
  dietType: "omnivore" | "vegetarian" | "vegan" | "keto" | "paleo" | "mediterranean";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  weightLbs: number;
  heightInches: number;
  age: number;
  gender?: "male" | "female" | "other";
  restrictions?: string;
  cuisines?: string;
  mealsPerDay: 3 | 4 | 5;
  cookingSkill: "beginner" | "intermediate" | "advanced";
  budget: "low" | "medium" | "high";
  updatedAt: string;
}

export interface MealPlanOverview {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string;
}

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Recipe {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DayMeals {
  day: string;
  totalCalories: number;
  meals: Recipe[];
}

export interface GroceryItem {
  name: string;
  amount: string;
  usedIn: string[];
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface MealPlan {
  id: string;
  userId: string;
  overview: MealPlanOverview;
  weeklySchedule: DayMeals[];
  groceryList: GroceryCategory[];
  version: number;
  createdAt: string;
}
