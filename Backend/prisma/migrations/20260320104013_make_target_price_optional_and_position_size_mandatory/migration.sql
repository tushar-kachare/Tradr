/*
  Warnings:

  - Made the column `positionSize` on table `trades` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "trades" ALTER COLUMN "targetPrice" DROP NOT NULL,
ALTER COLUMN "positionSize" SET NOT NULL;
