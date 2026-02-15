/*
  Warnings:

  - A unique constraint covering the columns `[year,primaryEmail]` on the table `ActiveOfficer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ActiveOfficer_year_primaryEmail_key` ON `ActiveOfficer`(`year`, `primaryEmail`);
