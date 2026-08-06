const { Client } = require('pg');

async function getLivePolicies() {
  const client = new Client({
    connectionString: "postgresql://postgres:%40Azumarill143@db.ppxgshogqczgkqermooz.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Query table structure
    const tablesRes = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    console.log("=== PUBLIC TABLES ===");
    tablesRes.rows.forEach(r => console.log(r.tablename));
    console.log("");
    
    // Query RLS Policies
    const policiesRes = await client.query(`
      SELECT tablename, policyname, cmd, roles, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    
    console.log("=== RLS POLICIES ===");
    if (policiesRes.rows.length === 0) {
      console.log("No policies found in the public schema.");
    } else {
      let currentTable = "";
      policiesRes.rows.forEach(row => {
        if (row.tablename !== currentTable) {
          console.log(`\nTable: ${row.tablename}`);
          currentTable = row.tablename;
        }
        console.log(`  - Policy: [${row.cmd}] ${row.policyname}`);
        // console.log(`    Roles: ${row.roles}`);
      });
    }

  } catch (error) {
    console.error("Error fetching policies:", error);
  } finally {
    await client.end();
  }
}

getLivePolicies();
