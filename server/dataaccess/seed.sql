-- seed.sql for Initial Database State
-- Run this after schema.sql to populate the static data.

SET search_path TO "windmilliot";

-- Seed the 4 windmills defined in the guidelines
INSERT INTO "turbines" ("id", "name", "location", "farmId") VALUES
('turbine-alpha', 'Alpha', 'North Platform', '0b57aefe-6e6c-4a36-ad90-880321aa6d7b'),
('turbine-beta', 'Beta', 'North Platform', '0b57aefe-6e6c-4a36-ad90-880321aa6d7b'),
('turbine-gamma', 'Gamma', 'South Platform', '0b57aefe-6e6c-4a36-ad90-880321aa6d7b'),
('turbine-delta', 'Delta', 'East Platform', '0b57aefe-6e6c-4a36-ad90-880321aa6d7b')
ON CONFLICT ("id") DO NOTHING;

-- Placeholder user
INSERT INTO "users" ("id", "username", "passwordHash", "role") VALUES
('op-1', 'operator', 'windmill123', 'operator'),
('adm-1', 'admin', 'admin', 'admin')
ON CONFLICT ("username") DO NOTHING;
