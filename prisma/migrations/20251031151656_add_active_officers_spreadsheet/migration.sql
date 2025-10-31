-- CreateTable
CREATE TABLE `ActiveOfficer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `number` INTEGER NOT NULL,
    `provincialRank` VARCHAR(191) NOT NULL,
    `givenName` VARCHAR(191) NOT NULL,
    `familyName` VARCHAR(191) NOT NULL,
    `familiarName` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ActiveOfficer_year_number_key`(`year`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
