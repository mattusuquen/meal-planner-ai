-- Migration: Convert from gym planner to meal planner
-- Drop old training_plans table
DROP TABLE IF EXISTS "training_plans";

-- Create meal_plans table
CREATE TABLE "meal_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_json" JSONB NOT NULL,
    "plan_text" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_meal_plans_user_id" ON "meal_plans"("user_id");

-- Update user_profiles: drop old columns, add new ones
ALTER TABLE "user_profiles"
  DROP COLUMN IF EXISTS "days_per_week",
  DROP COLUMN IF EXISTS "session_length",
  DROP COLUMN IF EXISTS "equipment",
  DROP COLUMN IF EXISTS "preferred_split";

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "diet_type" VARCHAR(30),
  ADD COLUMN IF NOT EXISTS "activity_level" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "weight_lbs" INTEGER,
  ADD COLUMN IF NOT EXISTS "height_inches" INTEGER,
  ADD COLUMN IF NOT EXISTS "age" INTEGER,
  ADD COLUMN IF NOT EXISTS "gender" VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "cuisines" TEXT,
  ADD COLUMN IF NOT EXISTS "meals_per_day" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "cooking_skill" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "budget" VARCHAR(10);

-- Alter goal column to support new values (increase length)
ALTER TABLE "user_profiles"
  ALTER COLUMN "goal" TYPE VARCHAR(30);

-- Set defaults for new required columns on existing rows (if any)
UPDATE "user_profiles"
SET
  "diet_type" = COALESCE("diet_type", 'omnivore'),
  "activity_level" = COALESCE("activity_level", 'moderate'),
  "weight_lbs" = COALESCE("weight_lbs", 150),
  "height_inches" = COALESCE("height_inches", 68),
  "age" = COALESCE("age", 30),
  "cooking_skill" = COALESCE("cooking_skill", 'intermediate'),
  "budget" = COALESCE("budget", 'medium')
WHERE "diet_type" IS NULL OR "activity_level" IS NULL;

-- Make new required columns NOT NULL
ALTER TABLE "user_profiles"
  ALTER COLUMN "diet_type" SET NOT NULL,
  ALTER COLUMN "activity_level" SET NOT NULL,
  ALTER COLUMN "weight_lbs" SET NOT NULL,
  ALTER COLUMN "height_inches" SET NOT NULL,
  ALTER COLUMN "age" SET NOT NULL,
  ALTER COLUMN "cooking_skill" SET NOT NULL,
  ALTER COLUMN "budget" SET NOT NULL;
