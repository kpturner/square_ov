-- Temporarily disable FK enforcement
SET FOREIGN_KEY_CHECKS = 0;

UPDATE Officer
SET attending = 1;

-- Re-enable FK enforcement
SET FOREIGN_KEY_CHECKS = 1;

