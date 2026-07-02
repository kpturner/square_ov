/*
  Warnings:

  - You are about to drop the column `lastLoginDate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `lastLoginDate`,
    ADD COLUMN `lastAccessDate` DATETIME(3) NULL;
