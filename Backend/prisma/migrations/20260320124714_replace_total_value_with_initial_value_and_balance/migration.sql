/*
  Warnings:

  - You are about to drop the column `totalValue` on the `portfolios` table. All the data in the column will be lost.
  - Added the required column `balance` to the `portfolios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initialValue` to the `portfolios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "portfolios" DROP COLUMN "totalValue",
ADD COLUMN     "balance" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "initialValue" DECIMAL(65,30) NOT NULL;
