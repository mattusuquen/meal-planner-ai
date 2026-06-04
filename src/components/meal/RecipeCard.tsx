import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, Users, RefreshCw } from "lucide-react";
import type { Recipe } from "../../types";
import { Card } from "../ui/Card";

const mealTypeColors: Record<string, string> = {
  breakfast: "bg-amber-500/10 text-amber-400",
  lunch: "bg-sky-500/10 text-sky-400",
  dinner: "bg-violet-500/10 text-violet-400",
  snack: "bg-emerald-500/10 text-emerald-400",
};

interface RecipeCardProps {
  recipe: Recipe;
  dayLabel?: string;
  onRefresh?: () => Promise<void>;
}

export function RecipeCard({ recipe, dayLabel, onRefresh }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    setExpanded(false);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }
  const totalTime = recipe.prepTime && recipe.cookTime
    ? `${recipe.prepTime} prep · ${recipe.cookTime} cook`
    : recipe.prepTime || recipe.cookTime || "";

  return (
    <Card variant="bordered" className={`overflow-hidden transition-opacity ${isRefreshing ? "opacity-60" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                mealTypeColors[recipe.type] || "bg-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              {recipe.type}
            </span>
            {dayLabel && (
              <span className="text-xs text-[var(--color-muted)]">{dayLabel}</span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug">{recipe.name}</h3>
        </div>
        <div className="flex items-start gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Get a different recipe"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          )}
          <div className="text-right">
            <p className="text-[var(--color-accent)] font-bold text-lg">
              {recipe.calories}
            </p>
            <p className="text-xs text-[var(--color-muted)]">kcal</p>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-muted)] mb-3">
        {totalTime && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalTime}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Macro pills */}
      <div className="flex gap-2 mb-4">
        <MacroPill label="Protein" value={recipe.nutrition.protein} color="text-blue-400" />
        <MacroPill label="Carbs" value={recipe.nutrition.carbs} color="text-amber-400" />
        <MacroPill label="Fat" value={recipe.nutrition.fat} color="text-rose-400" />
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors w-full text-left"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" /> Hide recipe
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> View recipe
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-[var(--color-border)] pt-4">
          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Ingredients
              </h4>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{ing.name}</span>
                    <span className="text-[var(--color-muted)]">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                Instructions
              </h4>
              <ol className="space-y-2">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs flex items-center justify-center font-medium mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[var(--color-muted)] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function MacroPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-center">
      <p className={`text-xs font-semibold ${color}`}>{value}g</p>
      <p className="text-[10px] text-[var(--color-muted)]">{label}</p>
    </div>
  );
}
