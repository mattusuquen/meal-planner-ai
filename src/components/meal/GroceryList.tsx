import { useState } from "react";
import { ShoppingCart, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { GroceryCategory } from "../../types";
import { Card } from "../ui/Card";

const categoryIcons: Record<string, string> = {
  Produce: "🥦",
  Proteins: "🥩",
  "Dairy & Eggs": "🥚",
  "Grains & Bread": "🍞",
  "Canned & Dry Goods": "🥫",
  "Oils, Sauces & Condiments": "🫙",
  Frozen: "🧊",
  Other: "🛒",
};

interface GroceryListProps {
  groceryList: GroceryCategory[];
}

export function GroceryList({ groceryList }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleItem(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCategory(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const totalItems = groceryList.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checked.size;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <Card variant="bordered" className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">Shopping Progress</span>
            <span className="text-[var(--color-muted)]">
              {checkedCount} / {totalItems} items
            </span>
          </div>
          <div className="w-full bg-[var(--color-border)] rounded-full h-2">
            <div
              className="bg-[var(--color-accent)] h-2 rounded-full transition-all"
              style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Categories */}
      {groceryList.map((cat) => {
        const isCollapsed = collapsed.has(cat.category);
        const catChecked = cat.items.filter((item) =>
          checked.has(`${cat.category}:${item.name}`)
        ).length;

        return (
          <Card key={cat.category} variant="bordered" className="overflow-hidden p-0">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.category)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-background)]/50 transition-colors"
            >
              <span className="text-xl">
                {categoryIcons[cat.category] || "🛒"}
              </span>
              <div className="flex-1 text-left">
                <span className="font-semibold">{cat.category}</span>
                <span className="text-xs text-[var(--color-muted)] ml-2">
                  {catChecked}/{cat.items.length}
                </span>
              </div>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" />
              )}
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="border-t border-[var(--color-border)]">
                {cat.items.map((item) => {
                  const key = `${cat.category}:${item.name}`;
                  const isChecked = checked.has(key);

                  return (
                    <button
                      key={key}
                      onClick={() => toggleItem(key)}
                      className={`w-full flex items-center gap-3 px-5 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)]/50 transition-colors text-left ${
                        isChecked ? "opacity-50" : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-[var(--color-accent)] border-[var(--color-accent)]"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isChecked ? "line-through" : ""
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.usedIn && item.usedIn.length > 0 && (
                          <p className="text-xs text-[var(--color-muted)] truncate">
                            Used in: {item.usedIn.slice(0, 3).join(", ")}
                            {item.usedIn.length > 3 && ` +${item.usedIn.length - 3} more`}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-[var(--color-muted)] shrink-0">
                        {item.amount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
