import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const migrationFile = path.join(__dirname, "..", "supabase", "migrations", "001_schema.sql");
  
  if (!fs.existsSync(migrationFile)) {
    console.error("Migration file not found:", migrationFile);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, "utf8");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("✅ Connected to Supabase PostgreSQL");
    
    await client.query(sql);
    console.log("✅ Migration applied successfully");
    
    // Verify tables
    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
    );
    console.log("\n📋 Tables created (" + rows.length + " total):");
    rows.forEach((r) => console.log("   - " + r.table_name));
    
    // Verify seed data
    const { rows: plans } = await client.query("SELECT name, monthly_price FROM subscription_plans ORDER BY sort_order");
    console.log("\n📋 Subscription plans seeded:");
    plans.forEach((p) => console.log("   - " + p.name + ": Rs. " + p.monthly_price));
    
    await client.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
