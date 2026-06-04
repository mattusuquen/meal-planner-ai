import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  RefreshCcw,
  Calendar,
  ShoppingCart,
  ChefHat,
  Flame,
  Loader2,
} from "lucide-react";
import { WeekView } from "../components/meal/WeekView";
import { RecipeCard } from "../components/meal/RecipeCard";
import { GroceryList } from "../components/meal/GroceryList";
import type { Recipe } from "../types";

type Tab = "week" | "recipes" | "grocery";

const tabs: { id: Tab; label: string; icon: typeof Calendar }[] = [
  { id: "week", label: "This Week", icon: Calendar },
  { id: "recipes", label: "Recipes", icon: ChefHat },
  { id: "grocery", label: "Grocery List", icon: ShoppingCart },
];

export default function Profile() {
  const { user, isLoading, plan, generatePlan, refreshMeal } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("week");
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!user && !isLoading) return <Navigate to="/auth/sign-in" replace />;
  if (!plan && !isLoading) return <Navigate to="/onboarding" replace />;
  if (!plan) return null;

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      await generatePlan();
    } finally {
      setIsRegenerating(false);
    }
  }

  // Flatten all recipes across the week
  const allRecipes: (Recipe & { dayLabel: string })[] = plan.weeklySchedule.flatMap(
    (day) => day.meals.map((meal) => ({ ...meal, dayLabel: day.day }))
  );

  const totalItems = plan.groceryList.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Meal Plan</h1>
            <p className="text-[var(--color-muted)] text-sm">
              Version {plan.version} ·{" "}
              {new Date(plan.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="secondary"
            className="gap-2 shrink-0"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Regenerate
          </Button>
        </div>

        {/* Nutrition overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <NutritionCard
            icon={Flame}
            label="Daily Calories"
            value={plan.overview.dailyCalories.toString()}
            unit="kcal"
            accent
          />
          <NutritionCard
            label="Protein"
            value={plan.overview.protein.toString()}
            unit="g/day"
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <NutritionCard
            label="Carbs"
            value={plan.overview.carbs.toString()}
            unit="g/day"
            color="text-amber-400"
            bgColor="bg-amber-500/10"
          />
          <NutritionCard
            label="Fat"
            value={plan.overview.fat.toString()}
            unit="g/day"
            color="text-rose-400"
            bgColor="bg-rose-500/10"
          />
        </div>

        {/* Plan notes */}
        {plan.overview.notes && (
          <Card variant="bordered" className="mb-8">
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              {plan.overview.notes}
            </p>
          </Card>
        )}

        {/* Tab navigation */}
        <div className="flex gap-1 p-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--color-accent)] text-black shadow-sm"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === "grocery" && totalItems > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-black/20 text-black"
                      : "bg-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "week" && (
          <WeekView
            weeklySchedule={plan.weeklySchedule}
            onRefreshMeal={refreshMeal}
          />
        )}

        {activeTab === "recipes" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-muted)] mb-2">
              {allRecipes.length} recipes across 7 days
            </p>
            {allRecipes.map((recipe, i) => (
              <RecipeCard
                key={i}
                recipe={recipe}
                dayLabel={recipe.dayLabel}
                onRefresh={() => refreshMeal(recipe.dayLabel, recipe.type, recipe.name)}
              />
            ))}
          </div>
        )}

        {activeTab === "grocery" && (
          <GroceryList groceryList={plan.groceryList} />
        )}
      </div>
    </div>
  );
}

function NutritionCard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
  color,
  bgColor,
}: {
  icon?: typeof Flame;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
  color?: string;
  bgColor?: string;
}) {
  return (
    <Card
      variant="bordered"
      className={accent ? "border-[var(--color-accent)]/30" : ""}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <Icon
            className={`w-4 h-4 ${accent ? "text-[var(--color-accent)]" : color || "text-[var(--color-muted)]"}`}
          />
        )}
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
      </div>
      <div className={`inline-flex items-baseline gap-1 px-2 py-1 rounded-lg ${bgColor || (accent ? "bg-[var(--color-accent)]/10" : "")}`}>
        <span
          className={`text-xl font-bold ${accent ? "text-[var(--color-accent)]" : color || ""}`}
        >
          {value}
        </span>
        <span className={`text-xs ${accent ? "text-[var(--color-accent)]/70" : "text-[var(--color-muted)]"}`}>
          {unit}
        </span>
      </div>
    </Card>
  );
}
