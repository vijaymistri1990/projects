-- Migration to add new fields to sm_simulator table
-- Fields: locale, location, latitude, longtitude, result_show

ALTER TABLE sm_simulator 
ADD COLUMN IF NOT EXISTS locale VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS latitude VARCHAR(50),
ADD COLUMN IF NOT EXISTS longtitude VARCHAR(50),
ADD COLUMN IF NOT EXISTS result_show INT;
