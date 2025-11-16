-- AlterTable
ALTER TABLE `Officer` ADD COLUMN `positionOverride` VARCHAR(191) NULL,
    MODIFY `position` ENUM('automatic', 'head_of_south', 'head_of_north', 'sword_bearer', 'standard_bearer', 'vip') NULL DEFAULT 'automatic';
