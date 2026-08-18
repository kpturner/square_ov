/*
  Warnings:

  - A unique constraint covering the columns `[ovType,year,provincialRank,primaryEmail]` on the table `ActiveOfficer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ActiveOfficer_ovType_year_primaryEmail_key` ON `ActiveOfficer`;

-- CreateIndex
CREATE UNIQUE INDEX `ActiveOfficer_ovType_year_provincialRank_primaryEmail_key` ON `ActiveOfficer`(`ovType`, `year`, `provincialRank`, `primaryEmail`);
