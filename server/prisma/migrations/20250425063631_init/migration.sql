/*
  Warnings:

  - You are about to drop the column `clerkId` on the `LoginUser` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `LoginUser` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LoginUser` table. All the data in the column will be lost.
  - Added the required column `bookName` to the `LoginUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `LoginUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDescription` to the `LoginUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `LoginUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `LoginUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LoginUser_clerkId_key";

-- DropIndex
DROP INDEX "LoginUser_email_key";

-- AlterTable
ALTER TABLE "LoginUser" DROP COLUMN "clerkId",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "bookName" TEXT NOT NULL,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventDescription" TEXT NOT NULL,
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "projectName" TEXT NOT NULL;
