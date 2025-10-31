/*
  Warnings:

  - You are about to alter the column `sword` on the `OVMaster` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `standard` on the `OVMaster` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `steward` on the `OVMaster` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `OVMaster` MODIFY `sword` INTEGER NULL,
    MODIFY `standard` INTEGER NULL,
    MODIFY `steward` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_sword_fkey` FOREIGN KEY (`year`, `sword`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_standard_fkey` FOREIGN KEY (`year`, `standard`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_steward_fkey` FOREIGN KEY (`year`, `steward`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;
