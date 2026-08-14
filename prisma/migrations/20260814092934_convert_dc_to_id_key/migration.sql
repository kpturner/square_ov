-- AlterTable
ALTER TABLE `OVMaster` ADD COLUMN `dcId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_dcId_fkey` FOREIGN KEY (`ovType`, `year`, `dcId`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;
