/*
  Warnings:

  - Added the required column `userId` to the `LoginUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LoginUser" ADD COLUMN     "userId" TEXT NOT NULL;
