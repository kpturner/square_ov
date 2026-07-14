-- AlterTable
ALTER TABLE `OVMaster` ADD COLUMN `adc` INTEGER NULL;

-- CreateTable
CREATE TABLE `OVMasterAdditionalOfficer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ovMasterId` INTEGER NOT NULL,
    `activeOfficerId` INTEGER NOT NULL,

    INDEX `OVMasterAdditionalOfficer_activeOfficerId_idx`(`activeOfficerId`),
    UNIQUE INDEX `OVMasterAdditionalOfficer_ovMasterId_activeOfficerId_key`(`ovMasterId`, `activeOfficerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OVMasterAdditionalOfficer` ADD CONSTRAINT `OVMasterAdditionalOfficer_ovMasterId_fkey` FOREIGN KEY (`ovMasterId`) REFERENCES `OVMaster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMasterAdditionalOfficer` ADD CONSTRAINT `OVMasterAdditionalOfficer_activeOfficerId_fkey` FOREIGN KEY (`activeOfficerId`) REFERENCES `ActiveOfficer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
