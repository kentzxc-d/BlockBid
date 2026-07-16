const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "web/.env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function check() {
  const { data, error } = await supabase.from("notifications").select("*").limit(1);
  if (error) {
    console.error("Notifications table error:", error.message);
  } else {
    console.log("Notifications table exists!");
    console.log("Data:", data);
  }

  const { data: pData, error: pError } = await supabase.from("projects").select("id, status, awarded_supplier_id").eq("status", "awarded");
  if (pError) {
    console.error("Projects table error:", pError.message);
  } else {
    console.log("Awarded projects:", pData);
  }
}
check();
