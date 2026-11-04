CREATE TYPE "OrderStatus" AS ENUM ('pending', 'processing', 'shipped', 'delivered');
CREATE TABLE "Order" (
  "id" UUID NOT NULL,
  "userId" TEXT NOT NULL,
  "item" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
