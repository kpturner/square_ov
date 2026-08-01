-- AlterTable
ALTER TABLE `OVMaster` ADD COLUMN `activeOfficerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_ovType_year_adc_fkey` FOREIGN KEY (`ovType`, `year`, `adc`) REFERENCES `ActiveOfficer`(`ovType`, `year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_activeOfficerId_fkey` FOREIGN KEY (`activeOfficerId`) REFERENCES `ActiveOfficer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
