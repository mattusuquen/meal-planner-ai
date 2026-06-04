-- Drop remaining old gym-planner columns from user_profiles
ALTER TABLE "user_profiles"
  DROP COLUMN IF EXISTS "experience";
