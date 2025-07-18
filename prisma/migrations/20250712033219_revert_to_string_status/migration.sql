/*
  Warnings:

  - You are about to drop the column `statusId` on the `Job` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_statusId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "statusId",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'applied';
