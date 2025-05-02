/*
  Warnings:

  - The primary key for the `ContributionDeadlines` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ContributionDeadlines" DROP CONSTRAINT "ContributionDeadlines_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ContributionDeadlines_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ContributionDeadlines_id_seq";
