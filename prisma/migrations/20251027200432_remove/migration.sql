/*
  Warnings:

  - The values [rear_of_south,rear_of_north] on the enum `Officer_position` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Officer` MODIFY `position` ENUM('automatic', 'head_of_south', 'head_of_north', 'sword_bearer', 'standard_bearer', 'vip') NOT NULL DEFAULT 'automatic';
