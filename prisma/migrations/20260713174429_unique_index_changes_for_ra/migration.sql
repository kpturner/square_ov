/*
  Warnings:

  - A unique constraint covering the columns `[ovType,year,primaryEmail]` on the table `ActiveOfficer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ActiveOfficer_year_primaryEmail_key` ON `ActiveOfficer`;

-- CreateIndex
CREATE UNIQUE INDEX `ActiveOfficer_ovType_year_primaryEmail_key` ON `ActiveOfficer`(`ovType`, `year`, `primaryEmail`);
