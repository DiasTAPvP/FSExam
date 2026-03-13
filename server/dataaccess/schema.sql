-- schema.sql for PostgreSQL (NeonDB)
-- Use this schema to initialize your database in the windmilliot schema.

CREATE SCHEMA IF NOT EXISTS "windmilliot";
SET search_path TO "windmilliot";

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "telemetry" CASCADE;
DROP TABLE IF EXISTS "alerts" CASCADE;
DROP TABLE IF EXISTS "commandLogs" CASCADE;
DROP TABLE IF EXISTS "turbines" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Users Table for authentication
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "username" VARCHAR(100) NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'operator'
);

-- Turbines Table for metadata
CREATE TABLE "turbines" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "farmId" TEXT NOT NULL
);

-- Telemetry Table for historical sensor data
CREATE TABLE "telemetry" (
    "id" SERIAL PRIMARY KEY,
    "turbineId" TEXT NOT NULL REFERENCES "turbines"("id"),
    "turbineName" VARCHAR(100),
    "farmId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "windDirection" DOUBLE PRECISION NOT NULL,
    "ambientTemperature" DOUBLE PRECISION NOT NULL,
    "rotorSpeed" DOUBLE PRECISION NOT NULL,
    "powerOutput" DOUBLE PRECISION NOT NULL,
    "nacelleDirection" DOUBLE PRECISION NOT NULL,
    "bladePitch" DOUBLE PRECISION NOT NULL,
    "generatorTemp" DOUBLE PRECISION NOT NULL,
    "gearboxTemp" DOUBLE PRECISION NOT NULL,
    "vibration" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'running'
);

CREATE INDEX "ix_telemetry_turbineId_timestamp" ON "telemetry" ("turbineId", "timestamp" DESC);

-- Alerts Table for incident history
CREATE TABLE "alerts" (
    "id" SERIAL PRIMARY KEY,
    "turbineId" TEXT NOT NULL REFERENCES "turbines"("id"),
    "farmId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "message" TEXT NOT NULL
);

CREATE INDEX "ix_alerts_turbineId_timestamp" ON "alerts" ("turbineId", "timestamp" DESC);

-- CommandLogs Table for audit trail of operator actions
CREATE TABLE "commandLogs" (
    "id" SERIAL PRIMARY KEY,
    "turbineId" TEXT NOT NULL REFERENCES "turbines"("id"),
    "action" VARCHAR(100) NOT NULL,
    "payload" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "operator" TEXT NOT NULL
);

CREATE INDEX "ix_commandLogs_turbineId_timestamp" ON "commandLogs" ("turbineId", "timestamp" DESC);
