/*
  Warnings:

  - You are about to drop the column `lodgeInt` on the `OVMaster` table. All the data in the column will be lost.
  - Added the required column `lodgeNumber` to the `OVMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OVMaster` DROP COLUMN `lodgeInt`,
    ADD COLUMN `lodgeNumber` VARCHAR(191) NOT NULL;
