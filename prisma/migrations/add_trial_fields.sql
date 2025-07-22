-- Add trial-related fields to User table
ALTER TABLE "User" ADD COLUMN "trial_start_date" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "trial_end_date" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "has_used_trial" BOOLEAN DEFAULT false; 