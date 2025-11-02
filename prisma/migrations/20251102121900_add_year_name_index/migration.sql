/*
  Warnings:

  - A unique constraint covering the columns `[year,name]` on the table `VIP` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `VIP_year_name_key` ON `VIP`(`year`, `name`);
