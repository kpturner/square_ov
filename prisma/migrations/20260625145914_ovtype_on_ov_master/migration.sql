/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,type]` on the table `OV` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type,year,number]` on the table `OVMaster` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `OV` DROP FOREIGN KEY `OV_userId_fkey`;

-- DropIndex
DROP INDEX `OV_userId_name_key` ON `OV`;

-- DropIndex
DROP INDEX `OVMaster_year_number_key` ON `OVMaster`;

-- AlterTable
ALTER TABLE `OVMaster` ADD COLUMN `type` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';

-- CreateIndex
CREATE UNIQUE INDEX `OV_userId_name_type_key` ON `OV`(`userId`, `name`, `type`);

-- CreateIndex
CREATE UNIQUE INDEX `OVMaster_type_year_number_key` ON `OVMaster`(`type`, `year`, `number`);

-- AddForeignKey
ALTER TABLE `OV` ADD CONSTRAINT `OV_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
