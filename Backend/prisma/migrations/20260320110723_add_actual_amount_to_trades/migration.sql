/*
  Warnings:

  - Added the required column `actualAmount` to the `trades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "trades" ADD COLUMN     "actualAmount" DECIMAL(65,30) NOT NULL;
