import { useState } from "react";
import type { DayMeals } from "../../types";
import { RecipeCard } from "./RecipeCard";

const DAY_ABBR: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

interface WeekViewProps {
  weeklySchedule: DayMeals[];
}

export function WeekView({ weeklySchedule }: WeekViewProps) {
  const [activeDay, setActiveDay] = useState(0);
  const today = weeklySchedule[activeDay];

  return (
    <div>
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {weeklySchedule.map((day, i) => (
          <button
            key={day.day}
            onClick={() => setActiveDay(i)}
            className={`flex-1 min-w-0 px-4 py-2 rounded-xl px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay === i
                ? "bg-[var(--color-accent)] text-black"
                : "bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40"
              }`}
          >
            <span className="block">{DAY_ABBR[day.day] || day.day.slice(0, 3)}</span>
            <span className="block text-[10px] mt-0.5 opacity-70">
              {day.totalCalories} cal
            </span>
          </button>
        ))}
      </div>

      {/* Day header */}
      {today && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{today.day}</h3>
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <span className="text-[var(--color-accent)] font-medium">
                {today.totalCalories}
              </span>
              <span>kcal total</span>
            </div>
          </div>

          <div className="space-y-4">
            {today.meals.map((meal, i) => (
              <RecipeCard key={i} recipe={meal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
