/*
  Warnings:

  - A unique constraint covering the columns `[type,year,number]` on the table `ActiveOfficer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,year,name]` on the table `VIP` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer1_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer2_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer3_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer4_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer5_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer6_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_officer7_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_standard_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_steward_fkey`;

-- DropForeignKey
ALTER TABLE `OVMaster` DROP FOREIGN KEY `OVMaster_year_sword_fkey`;

-- DropIndex
DROP INDEX `ActiveOfficer_year_number_key` ON `ActiveOfficer`;

-- DropIndex
DROP INDEX `OVMaster_year_officer1_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer2_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer3_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer4_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer5_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer6_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_officer7_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_standard_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_steward_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `OVMaster_year_sword_fkey` ON `OVMaster`;

-- DropIndex
DROP INDEX `VIP_year_name_key` ON `VIP`;

-- AlterTable
ALTER TABLE `ActiveOfficer` ADD COLUMN `type` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- AlterTable
ALTER TABLE `VIP` ADD COLUMN `type` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- CreateIndex
CREATE UNIQUE INDEX `ActiveOfficer_type_year_number_key` ON `ActiveOfficer`(`type`, `year`, `number`);

-- CreateIndex
CREATE UNIQUE INDEX `VIP_type_year_name_key` ON `VIP`(`type`, `year`, `name`);

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_sword_fkey` FOREIGN KEY (`type`, `year`, `sword`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_standard_fkey` FOREIGN KEY (`type`, `year`, `standard`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_steward_fkey` FOREIGN KEY (`type`, `year`, `steward`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer1_fkey` FOREIGN KEY (`type`, `year`, `officer1`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer2_fkey` FOREIGN KEY (`type`, `year`, `officer2`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer3_fkey` FOREIGN KEY (`type`, `year`, `officer3`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer4_fkey` FOREIGN KEY (`type`, `year`, `officer4`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer5_fkey` FOREIGN KEY (`type`, `year`, `officer5`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer6_fkey` FOREIGN KEY (`type`, `year`, `officer6`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_type_year_officer7_fkey` FOREIGN KEY (`type`, `year`, `officer7`) REFERENCES `ActiveOfficer`(`type`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;
