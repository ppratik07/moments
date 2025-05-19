/*
  Warnings:

  - Added the required column `project_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "project_id" TEXT NOT NULL;
