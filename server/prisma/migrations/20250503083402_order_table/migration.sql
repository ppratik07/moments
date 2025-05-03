-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LoginUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
