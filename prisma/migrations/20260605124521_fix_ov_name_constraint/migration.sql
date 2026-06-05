/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `OV` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `OV_name_key` ON `OV`;

-- CreateIndex
CREATE UNIQUE INDEX `OV_userId_name_key` ON `OV`(`userId`, `name`);
