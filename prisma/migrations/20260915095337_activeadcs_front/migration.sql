-- AlterTable
ALTER TABLE `OV` ADD COLUMN `activeADCsFront` BOOLEAN NOT NULL DEFAULT true;

UPDATE `OV`
SET `activeADCsFront` = `activeDCsFront`;
