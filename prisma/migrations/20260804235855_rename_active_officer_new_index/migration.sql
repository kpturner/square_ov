-- RedefineIndex
CREATE INDEX `type_year_familyName_provincialRank` ON `ActiveOfficer`(`ovType`, `year`, `familyName`, `provincialRank`);
DROP INDEX `type_year_familyName_provincialRank_index` ON `ActiveOfficer`;
