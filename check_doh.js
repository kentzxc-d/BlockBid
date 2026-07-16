const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const toml = require('toml');

// Read config for url and key. Or just use the env vars if available.
// Since we don't know the remote URL easily from here, maybe we can run a postgres query directly using docker or supabase cli?
