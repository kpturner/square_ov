-- Temporarily disable FK enforcement
SET FOREIGN_KEY_CHECKS = 0;

-- Update the parent first
UPDATE ActiveOfficer
SET year = '25-26'
WHERE year = '25 - 26';

-- Update the child next
UPDATE OVMaster
SET year = '25-26'
WHERE year = '25 - 26';

-- Update VIP too
UPDATE VIP
SET year = '25-26'
WHERE year = '25 - 26';

-- Re-enable FK enforcement
SET FOREIGN_KEY_CHECKS = 1;

