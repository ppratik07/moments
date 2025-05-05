-- AlterTable
ALTER TABLE "LoginUser" ADD COLUMN     "isFirstRender" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "previewPdfUrl" TEXT,
ADD COLUMN     "totalPages" INTEGER;
