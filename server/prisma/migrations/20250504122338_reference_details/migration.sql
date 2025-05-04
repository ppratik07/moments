/*
  Warnings:

  - Added the required column `projectId` to the `FillYourDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FillYourDetails" ADD COLUMN     "projectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FillYourDetails" ADD CONSTRAINT "FillYourDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LoginUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
