/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `maxSupply` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `sold` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketPriceFELI` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockchainEventId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTickets` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPrice` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'TICKET_PURCHASE';

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "maxSupply",
DROP COLUMN "sold",
DROP COLUMN "ticketPriceFELI",
ADD COLUMN     "blockchainEventId" INTEGER,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "maxTickets" INTEGER NOT NULL,
ADD COLUMN     "metadataURI" TEXT,
ADD COLUMN     "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ticketsSold" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Event_blockchainEventId_key" ON "Event"("blockchainEventId");

-- CreateIndex
CREATE INDEX "Event_blockchainEventId_idx" ON "Event"("blockchainEventId");
