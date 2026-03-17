/*
  Warnings:

  - You are about to drop the column `bookmarksCount` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `commentsCount` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `likesCount` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `repostsCount` on the `trades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "trades" DROP COLUMN "bookmarksCount",
DROP COLUMN "commentsCount",
DROP COLUMN "likesCount",
DROP COLUMN "repostsCount";
