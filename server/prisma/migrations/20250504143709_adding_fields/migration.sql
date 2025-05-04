-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "fillYourDetailsId" TEXT;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_fillYourDetailsId_fkey" FOREIGN KEY ("fillYourDetailsId") REFERENCES "FillYourDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
