import { RedirectToSignIn, SignedIn } from "@neondatabase/neon-js/auth/react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import type { UserProfile } from "../types";
import { useNavigate } from "react-router-dom";

const TOTAL_STEPS = 4;

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

const stepLabels = ["Body Info", "Goals & Activity", "Diet & Preferences", "Lifestyle"];

export default function Onboarding() {
  const { user, saveProfile, generatePlan } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    weightLbs: "",
    heightFt: "",
    heightIn: "",
    age: "",
    gender: "male",
    goal: "lose_weight",
    activityLevel: "moderate",
    dietType: "omnivore",
    restrictions: "",
    cuisines: "",
    mealsPerDay: "3",
    cookingSkill: "intermediate",
    budget: "medium",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 1) return form.weightLbs && form.heightFt && form.age;
    if (step === 2) return form.goal && form.activityLevel;
    if (step === 3) return form.dietType;
    return form.mealsPerDay && form.cookingSkill && form.budget;
  }

  async function handleSubmit() {
    const heightInches =
      parseInt(form.heightFt) * 12 + parseInt(form.heightIn || "0");

    const profile: Omit<UserProfile, "userId" | "updatedAt"> = {
      goal: form.goal as UserProfile["goal"],
      dietType: form.dietType as UserProfile["dietType"],
      activityLevel: form.activityLevel as UserProfile["activityLevel"],
      weightLbs: parseInt(form.weightLbs),
      heightInches,
      age: parseInt(form.age),
      gender: form.gender as UserProfile["gender"],
      restrictions: form.restrictions || undefined,
      cuisines: form.cuisines || undefined,
      mealsPerDay: parseInt(form.mealsPerDay) as 3 | 4 | 5,
      cookingSkill: form.cookingSkill as UserProfile["cookingSkill"],
      budget: form.budget as UserProfile["budget"],
    };

    try {
      setIsGenerating(true);
      setError("");
      await saveProfile(profile);
      await generatePlan();
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsGenerating(false);
    }
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <SignedIn>
      <div className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-xl mx-auto">
          {isGenerating ? (
            <Card variant="bordered" className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Building your meal plan…</h2>
              <p className="text-[var(--color-muted)] max-w-xs mx-auto">
                Our AI is crafting your personalized weekly meal plan with
                recipes and a grocery list. This takes about 30 seconds.
              </p>
            </Card>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--color-muted)]">
                    Step {step} of {TOTAL_STEPS}
                  </span>
                  <span className="text-sm font-medium text-[var(--color-accent)]">
                    {stepLabels[step - 1]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < step
                          ? "bg-[var(--color-accent)]"
                          : "bg-[var(--color-border)]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Card variant="bordered">
                {/* Step 1: Body Metrics */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Your body info</h2>
                      <p className="text-[var(--color-muted)] text-sm">
                        Used to calculate your daily calorie target.
                      </p>
                    </div>

                    <Select
                      id="gender"
                      label="Biological sex"
                      options={genderOptions}
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                    />

                    <Input
                      id="age"
                      label="Age"
                      type="number"
                      placeholder="e.g. 28"
                      min="16"
                      max="100"
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}
                    />

                    <Input
                      id="weight"
                      label="Weight (lbs)"
                      type="number"
                      placeholder="e.g. 165"
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
                          placeholder="Feet (e.g. 5)"
                          type="number"
                          min="3"
                          max="8"
                          value={form.heightFt}
                          onChange={(e) => update("heightFt", e.target.value)}
                        />
                        <Input
                          id="heightIn"
                          placeholder="Inches (e.g. 10)"
                          type="number"
                          min="0"
                          max="11"
                          value={form.heightIn}
                          onChange={(e) => update("heightIn", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Goals & Activity */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Your goals</h2>
                      <p className="text-[var(--color-muted)] text-sm">
                        What do you want to achieve with your diet?
                      </p>
                    </div>

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
                  </div>
                )}

                {/* Step 3: Diet Preferences */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Diet & preferences</h2>
                      <p className="text-[var(--color-muted)] text-sm">
                        Help us choose meals you'll actually enjoy.
                      </p>
                    </div>

                    <Select
                      id="dietType"
                      label="Diet type"
                      options={dietOptions}
                      value={form.dietType}
                      onChange={(e) => update("dietType", e.target.value)}
                    />

                    <Textarea
                      id="restrictions"
                      label="Food allergies or restrictions (optional)"
                      placeholder="e.g. gluten intolerant, nut allergy, no shellfish…"
                      rows={2}
                      value={form.restrictions}
                      onChange={(e) => update("restrictions", e.target.value)}
                    />

                    <Textarea
                      id="cuisines"
                      label="Favorite cuisines (optional)"
                      placeholder="e.g. Italian, Mexican, Asian, Mediterranean…"
                      rows={2}
                      value={form.cuisines}
                      onChange={(e) => update("cuisines", e.target.value)}
                    />
                  </div>
                )}

                {/* Step 4: Lifestyle */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Your lifestyle</h2>
                      <p className="text-[var(--color-muted)] text-sm">
                        So we can match recipes to your schedule and budget.
                      </p>
                    </div>

                    <Select
                      id="mealsPerDay"
                      label="Meals per day"
                      options={mealsOptions}
                      value={form.mealsPerDay}
                      onChange={(e) => update("mealsPerDay", e.target.value)}
                    />

                    <Select
                      id="cookingSkill"
                      label="Cooking experience"
                      options={skillOptions}
                      value={form.cookingSkill}
                      onChange={(e) => update("cookingSkill", e.target.value)}
                    />

                    <Select
                      id="budget"
                      label="Weekly grocery budget"
                      options={budgetOptions}
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-sm mt-4">{error}</p>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <Button
                      variant="secondary"
                      className="gap-2"
                      onClick={() => setStep((s) => s - 1)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  )}

                  {step < TOTAL_STEPS ? (
                    <Button
                      className="flex-1 gap-2"
                      disabled={!canAdvance()}
                      onClick={() => setStep((s) => s + 1)}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 gap-2"
                      disabled={!canAdvance()}
                      onClick={handleSubmit}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Generate My Meal Plan
                    </Button>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </SignedIn>
  );
}
