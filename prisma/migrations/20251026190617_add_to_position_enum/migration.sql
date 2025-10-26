-- AlterTable
ALTER TABLE `Officer` MODIFY `position` ENUM('automatic', 'rear_of_south', 'rear_of_north', 'head_of_south', 'head_of_north', 'sword_bearer', 'standard_bearer', 'vip') NOT NULL DEFAULT 'automatic';
