/**
 * Apply the 015_add_message_templates migration to Supabase.
 * Reads DATABASE_URL from .env.local and connects directly to PostgreSQL.
 *
 * Usage: node scripts/apply-015-migration.mjs
 */

import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Try to load dotenv from the project
try {
  require("dotenv");
} catch {
  // dotenv not installed — manually parse .env.local
}

// Manually parse .env.local to get DATABASE_URL
const envPath = resolve(__dirname, "..", ".env.local");
function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found at:", envPath);
    return {};
  }
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is required. Add it to .env.local");
    console.error("   Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)");
    process.exit(1);
  }

  const migrationFile = resolve(__dirname, "..", "supabase", "migrations", "015_add_message_templates.sql");
  if (!existsSync(migrationFile)) {
    console.error("❌ Migration file not found:", migrationFile);
    process.exit(1);
  }

  const sql = readFileSync(migrationFile, "utf8");

  const { Client } = require("pg");
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase PostgreSQL");

    // Check if table already exists
    const { rows: existing } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='message_templates'"
    );

    if (existing.length > 0) {
      console.log("ℹ️  message_templates table already exists. Skipping creation.");
      
      // Still try to apply indexes and RLS (idempotent)
      const indexSql = sql
        .split("\n")
        .filter(line => 
          line.includes("CREATE INDEX") || 
          line.includes("CREATE POLICY") ||
          line.includes("ALTER TABLE") ||
          line.includes("CREATE OR REPLACE FUNCTION")
        )
        .join("\n");

      if (indexSql.trim()) {
        await client.query(indexSql);
        console.log("✅ Indexes and policies applied");
      }
    } else {
      await client.query(sql);
      console.log("✅ Migration 015 applied successfully");
    }

    // Verify
    const { rows: tables } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
    );
    console.log("\n📋 Tables (" + tables.length + " total):");
    const msgTable = tables.find(r => r.table_name === "message_templates");
    if (msgTable) {
      console.log("   ✅ message_templates — CREATED");
    } else {
      console.log("   ❌ message_templates — NOT FOUND");
    }

    await client.end();
    console.log("\n✅ Migration complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message?.includes("password")) {
      console.error("\n   DATABASE_URL password may be incorrect.");
      console.error("   Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)");
    }
    process.exit(1);
  }
}

main();
