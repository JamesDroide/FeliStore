-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "maxRedemptions" INTEGER,
ADD COLUMN     "redemptionsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserCoupon" ADD COLUMN     "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
