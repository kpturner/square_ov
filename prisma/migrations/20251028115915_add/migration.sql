-- AlterTable
ALTER TABLE `OV` ADD COLUMN `activeDCsFront` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `alignWardens` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `includeGrandOfficers` BOOLEAN NOT NULL DEFAULT false;
