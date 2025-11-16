/*
  Warnings:

  - You are about to drop the column `positionOverride` on the `Officer` table. All the data in the column will be lost.
  - Made the column `position` on table `Officer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Officer` DROP COLUMN `positionOverride`,
    MODIFY `position` VARCHAR(191) NOT NULL;
