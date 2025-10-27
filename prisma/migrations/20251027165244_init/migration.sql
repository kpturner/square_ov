-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OV` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `ovDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `OV_name_key`(`name`),
    INDEX `OV_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Officer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `rank` VARCHAR(191) NULL,
    `grandOfficer` BOOLEAN NOT NULL,
    `grandOfficerYear` INTEGER NULL,
    `active` BOOLEAN NOT NULL,
    `ovId` INTEGER NOT NULL,
    `position` ENUM('automatic', 'rear_of_south', 'rear_of_north', 'head_of_south', 'head_of_north', 'sword_bearer', 'standard_bearer', 'vip') NOT NULL DEFAULT 'automatic',
    `grandActive` BOOLEAN NULL,
    `grandRank` VARCHAR(191) NULL,

    INDEX `Officer_ovId_fkey`(`ovId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OV` ADD CONSTRAINT `OV_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Officer` ADD CONSTRAINT `Officer_ovId_fkey` FOREIGN KEY (`ovId`) REFERENCES `OV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
