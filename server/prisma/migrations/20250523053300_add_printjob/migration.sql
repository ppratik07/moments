-- CreateTable
CREATE TABLE "PrintJob" (
    "id" TEXT NOT NULL,
    "lulu_job_id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintJob" ADD CONSTRAINT "PrintJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LoginUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
