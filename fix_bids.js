require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStuckBids() {
  console.log("Finding awarded projects...");
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .select("id, status")
    .eq("status", "awarded");

  if (projError) {
    console.error("Error fetching projects:", projError);
    return;
  }

  console.log(`Found ${projects.length} awarded projects.`);

  for (const project of projects) {
    console.log(`Fixing bids for project ${project.id}...`);
    // Find bids that are not 'won' and not 'rejected'
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("id, status")
      .eq("project_id", project.id)
      .neq("status", "won")
      .neq("status", "rejected");

    if (bidsError) {
      console.error(`Error fetching bids for project ${project.id}:`, bidsError);
      continue;
    }

    console.log(`Found ${bids.length} stuck bids in project ${project.id}.`);

    for (const bid of bids) {
      const { error: updateError } = await supabase
        .from("bids")
        .update({ status: "rejected" })
        .eq("id", bid.id);

      if (updateError) {
        console.error(`Failed to update bid ${bid.id}:`, updateError);
      } else {
        console.log(`Successfully updated bid ${bid.id} to rejected.`);
      }
    }
  }
  
  console.log("Done fixing stuck bids.");
}

fixStuckBids();
