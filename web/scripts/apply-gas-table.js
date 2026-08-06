const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function applyMigration() {
  // Use connection string from env
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // try to construct from url if DATABASE_URL is missing, but usually project has it.
    // Let's just rely on Supabase postgres string if they have one. 
    // Wait, the user might not have a postgres string. Let's just print instructions.
  }
  
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env.local. You must apply the migration manually.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const sql = fs.readFileSync('../supabase/migrations/20260806000000_create_gas_sponsorships.sql', 'utf8');
    await client.query(sql);
    console.log("Successfully created gas_sponsorships table.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

applyMigration();
