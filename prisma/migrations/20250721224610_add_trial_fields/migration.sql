/*
  Warnings:

  - Made the column `has_used_trial` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "has_used_trial" SET NOT NULL;
