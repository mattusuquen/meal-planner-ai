import { useEffect, useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import type { UserProfile } from "../types";

interface EditProfileModalProps {
  profile: Omit<UserProfile, "updatedAt">;
  onConfirm: (profile: Omit<UserProfile, "userId" | "updatedAt">) => Promise<void>;
  onClose: () => void;
}

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain_weight", label: "Gain Weight" },
  { value: "eat_healthier", label: "Eat Healthier" },
  { value: "build_muscle", label: "Build Muscle" },
];

const dietOptions = [
  { value: "omnivore", label: "Omnivore (everything)" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto / Low Carb" },
  { value: "paleo", label: "Paleo" },
  { value: "mediterranean", label: "Mediterranean" },
];

const activityOptions = [
  { value: "sedentary", label: "Sedentary (desk job, little exercise)" },
  { value: "light", label: "Lightly Active (1-3 days/week)" },
  { value: "moderate", label: "Moderately Active (3-5 days/week)" },
  { value: "active", label: "Very Active (6-7 days/week)" },
  { value: "very_active", label: "Extremely Active (physical job + daily exercise)" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / Prefer not to say" },
];

const mealsOptions = [
  { value: "3", label: "3 meals (breakfast, lunch, dinner)" },
  { value: "4", label: "4 meals (+ 1 snack)" },
  { value: "5", label: "5 meals (+ 2 snacks)" },
];

const skillOptions = [
  { value: "beginner", label: "Beginner (quick, simple recipes)" },
  { value: "intermediate", label: "Intermediate (moderate cooking)" },
  { value: "advanced", label: "Advanced (complex techniques ok)" },
];

const budgetOptions = [
  { value: "low", label: "Budget ($50-75/week)" },
  { value: "medium", label: "Moderate ($75-150/week)" },
  { value: "high", label: "Flexible ($150+/week)" },
];

export function EditProfileModal({ profile, onConfirm, onClose }: EditProfileModalProps) {
  const heightFt = Math.floor(profile.heightInches / 12);
  const heightIn = profile.heightInches % 12;

  const [form, setForm] = useState({
    goal: profile.goal,
    dietType: profile.dietType,
    activityLevel: profile.activityLevel,
    weightLbs: String(profile.weightLbs),
    heightFt: String(heightFt),
    heightIn: String(heightIn),
    age: String(profile.age),
    gender: profile.gender || "male",
    restrictions: profile.restrictions || "",
    cuisines: profile.cuisines || "",
    mealsPerDay: String(profile.mealsPerDay),
    cookingSkill: profile.cookingSkill,
    budget: profile.budget,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        goal: form.goal as UserProfile["goal"],
        dietType: form.dietType as UserProfile["dietType"],
        activityLevel: form.activityLevel as UserProfile["activityLevel"],
        weightLbs: parseInt(form.weightLbs),
        heightInches: parseInt(form.heightFt) * 12 + parseInt(form.heightIn || "0"),
        age: parseInt(form.age),
        gender: form.gender as UserProfile["gender"],
        restrictions: form.restrictions || undefined,
        cuisines: form.cuisines || undefined,
        mealsPerDay: parseInt(form.mealsPerDay) as 3 | 4 | 5,
        cookingSkill: form.cookingSkill as UserProfile["cookingSkill"],
        budget: form.budget as UserProfile["budget"],
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="font-bold text-lg">Edit Your Profile</h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Update your details before regenerating
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Body metrics */}
          <Section label="Body Info">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="age"
                label="Age"
                type="number"
                min="16"
                max="100"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
              <Select
                id="gender"
                label="Biological sex"
                options={genderOptions}
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              />
            </div>
            <Input
              id="weight"
              label="Weight (lbs)"
              type="number"
              min="80"
              max="500"
              value={form.weightLbs}
              onChange={(e) => update("weightLbs", e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-[var(--color-foreground)] block mb-1.5">
                Height
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="heightFt"
                  placeholder="Feet"
                  type="number"
                  min="3"
                  max="8"
                  value={form.heightFt}
                  onChange={(e) => update("heightFt", e.target.value)}
                />
                <Input
                  id="heightIn"
                  placeholder="Inches"
                  type="number"
                  min="0"
                  max="11"
                  value={form.heightIn}
                  onChange={(e) => update("heightIn", e.target.value)}
                />
              </div>
            </div>
          </Section>

          {/* Goals */}
          <Section label="Goals & Activity">
            <Select
              id="goal"
              label="Primary goal"
              options={goalOptions}
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
            />
            <Select
              id="activityLevel"
              label="Activity level"
              options={activityOptions}
              value={form.activityLevel}
              onChange={(e) => update("activityLevel", e.target.value)}
            />
          </Section>

          {/* Diet */}
          <Section label="Diet & Preferences">
            <Select
              id="dietType"
              label="Diet type"
              options={dietOptions}
              value={form.dietType}
              onChange={(e) => update("dietType", e.target.value)}
            />
            <Textarea
              id="restrictions"
              label="Allergies / restrictions (optional)"
              placeholder="e.g. gluten intolerant, nut allergy…"
              rows={2}
              value={form.restrictions}
              onChange={(e) => update("restrictions", e.target.value)}
            />
            <Textarea
              id="cuisines"
              label="Favorite cuisines (optional)"
              placeholder="e.g. Italian, Mexican, Asian…"
              rows={2}
              value={form.cuisines}
              onChange={(e) => update("cuisines", e.target.value)}
            />
          </Section>

          {/* Lifestyle */}
          <Section label="Lifestyle">
            <Select
              id="mealsPerDay"
              label="Meals per day"
              options={mealsOptions}
              value={form.mealsPerDay}
              onChange={(e) => update("mealsPerDay", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                id="cookingSkill"
                label="Cooking skill"
                options={skillOptions}
                value={form.cookingSkill}
                onChange={(e) => update("cookingSkill", e.target.value)}
              />
              <Select
                id="budget"
                label="Weekly budget"
                options={budgetOptions}
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
              />
            </div>
          </Section>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] shrink-0 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Save & Regenerate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  );
}
