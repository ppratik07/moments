-- CreateTable
CREATE TABLE "ContributionDeadlines" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "calculate_date" TIMESTAMP(3),
    "actual_deadline" TIMESTAMP(3),
    "deadline_enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionDeadlines_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContributionDeadlines" ADD CONSTRAINT "ContributionDeadlines_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LoginUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
