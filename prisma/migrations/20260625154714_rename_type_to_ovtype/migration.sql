/*
  Warnings:

  - You are about to drop the column `type` on the `ActiveOfficer` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OV` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OVMaster` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `VIP` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ovType,year,number]` on the table `ActiveOfficer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name,ovType]` on the table `OV` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ovType,year,number]` on the table `OVMaster` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ovType,year,name]` on the table `VIP` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `OV` DROP FOREIGN KEY `OV_userId_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer1_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer2_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer3_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer4_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer5_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer6_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_officer7_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_standard_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_steward_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_type_year_sword_fkey`;

-- DropIndex
DROP INDEX `ActiveOfficer_type_year_number_key` ON `ActiveOfficer`;

-- DropIndex
DROP INDEX `OV_userId_name_type_key` ON `OV`;

-- DropIndex
DROP INDEX `OVMaster_type_year_number_key` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer1_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer2_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer3_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer4_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer5_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer6_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_officer7_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_standard_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_steward_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_type_year_sword_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `VIP_type_year_name_key` ON `VIP`;

-- AlterTable
ALTER TABLE `ActiveOfficer` DROP COLUMN `type`,
    ADD COLUMN `ovType` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- AlterTable
ALTER TABLE `OV` DROP COLUMN `type`,
    ADD COLUMN `ovType` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- AlterTable
ALTER TABLE `OVMaster` DROP COLUMN `type`,
    ADD COLUMN `ovType` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- AlterTable
ALTER TABLE `VIP` DROP COLUMN `type`,
    ADD COLUMN `ovType` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- CreateIndex
CREATE UNIQUE INDEX `ActiveOfficer_ovType_year_number_key` ON `ActiveOfficer`(`ovType`, `year`, `number`);

-- CreateIndex
CREATE UNIQUE INDEX `OV_userId_name_ovType_key` ON `OV`(`userId`, `name`, `ovType`);

-- CreateIndex
CREATE UNIQUE INDEX `OVMaster_ovType_year_number_key` ON `OVMaster`(`ovType`, `year`, `number`);

-- CreateIndex
CREATE UNIQUE INDEX `VIP_ovType_year_name_key` ON `VIP`(`ovType`, `year`, `name`);

-- AddForeignKey
ALTER TABLE `OV` ADD CONSTRAINT `OV_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_sword_fkey` FOREIGN KEY (`ovType`, `year`, `sword`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_standard_fkey` FOREIGN KEY (`ovType`, `year`, `standard`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_steward_fkey` FOREIGN KEY (`ovType`, `year`, `steward`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer1_fkey` FOREIGN KEY (`ovType`, `year`, `officer1`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer2_fkey` FOREIGN KEY (`ovType`, `year`, `officer2`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer3_fkey` FOREIGN KEY (`ovType`, `year`, `officer3`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer4_fkey` FOREIGN KEY (`ovType`, `year`, `officer4`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer5_fkey` FOREIGN KEY (`ovType`, `year`, `officer5`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer6_fkey` FOREIGN KEY (`ovType`, `year`, `officer6`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_officer7_fkey` FOREIGN KEY (`ovType`, `year`, `officer7`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;
