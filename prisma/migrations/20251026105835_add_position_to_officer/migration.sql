-- AlterTable
ALTER TABLE `Officer` ADD COLUMN `position` ENUM('automatic', 'rear_of_south', 'rear_of_north', 'head_of_south', 'head_of_north', 'vip') NOT NULL DEFAULT 'automatic';
