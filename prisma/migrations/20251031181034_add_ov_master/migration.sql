-- CreateTable
CREATE TABLE `OVMaster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `lodgeName` VARCHAR(191) NOT NULL,
    `lodgeInt` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `vip` VARCHAR(191) NOT NULL,
    `dc` VARCHAR(191) NOT NULL,
    `sword` VARCHAR(191) NOT NULL,
    `standard` VARCHAR(191) NOT NULL,
    `steward` VARCHAR(191) NOT NULL,
    `officer1` INTEGER NULL,
    `officer2` INTEGER NULL,
    `officer3` INTEGER NULL,
    `officer4` INTEGER NULL,
    `officer5` INTEGER NULL,
    `officer6` INTEGER NULL,
    `officer7` INTEGER NULL,

    UNIQUE INDEX `OVMaster_year_number_key`(`year`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer1_fkey` FOREIGN KEY (`year`, `officer1`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer2_fkey` FOREIGN KEY (`year`, `officer2`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer3_fkey` FOREIGN KEY (`year`, `officer3`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer4_fkey` FOREIGN KEY (`year`, `officer4`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer5_fkey` FOREIGN KEY (`year`, `officer5`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer6_fkey` FOREIGN KEY (`year`, `officer6`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OVMaster` ADD CONSTRAINT `OVMaster_year_officer7_fkey` FOREIGN KEY (`year`, `officer7`) REFERENCES `ActiveOfficer`(`year`, `number`) ON DELETE RESTRICT ON UPDATE CASCADE;
