/*
  Warnings:

  - You are about to drop the column `realtionship` on the `FillYourDetails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `FillYourDetails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `FillYourDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `FillYourDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FillYourDetails" DROP COLUMN "realtionship",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "relationship" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FillYourDetails_email_key" ON "FillYourDetails"("email");
