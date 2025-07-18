/*
  Warnings:

  - Added the required column `refreshToken` to the `GmailToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GmailToken" ADD COLUMN     "refreshToken" TEXT NOT NULL;
