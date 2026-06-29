-- AlterTable
ALTER TABLE `OV` ADD COLUMN `type` ENUM('craft', 'ra') NOT NULL DEFAULT 'craft';
