const { createPublicClient, http } = require('viem');
const { createClient } = require('@supabase/supabase-js');
const { BlockBidABI } = require('./abi');

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define Polygon Amoy Chain config (since we can't import from frontend easily)
const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://polygon-amoy-bor-rpc.publicnode.com'] },
    public: { http: ['https://polygon-amoy-bor-rpc.publicnode.com'] },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/amoy' },
  },
};

const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http() 
});

let isSyncing = false;

async function syncEvents() {
  if (isSyncing) {
    console.log("Sync already in progress, skipping this interval...");
    return;
  }

  isSyncing = true;
  try {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('Missing NEXT_PUBLIC_CONTRACT_ADDRESS in environment');
    }

    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - BigInt(10); // look back ~10 blocks

    console.log(`Cron syncing blocks ${fromBlock} to ${currentBlock}`);

    const awardEvents = await publicClient.getContractEvents({
      address: contractAddress,
      abi: BlockBidABI,
      eventName: 'AwardFinalized',
      fromBlock,
      toBlock: currentBlock
    });

    console.log(`Found ${awardEvents.length} AwardFinalized events.`);
    
    let syncedCount = 0;

    for (const event of awardEvents) {
      const args = event.args;
      if (!args || !args.projectId || !args.supplier) continue;
      
      const projectId = args.projectId;
      const winnerAddress = args.supplier.toLowerCase();

      // Get project from DB
      const { data: project } = await supabase
        .from('projects')
        .select('id, status')
        .eq('id', projectId)
        .single();

      if (!project) continue;

      // Get winner profile id from wallet address
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, wallet_address');
        
      const winnerProfile = profiles?.find(p => p.wallet_address?.toLowerCase() === winnerAddress);
      
      if (!winnerProfile) {
        console.warn(`Winner profile not found for wallet ${winnerAddress}`);
        continue;
      }

      // Update project status if needed
      if (project.status !== 'awarded') {
        await supabase.from('projects').update({
          status: 'awarded',
          awarded_supplier_id: winnerProfile.id
        }).eq('id', projectId);
        console.log(`Updated project ${projectId} to awarded.`);
      }

      // Update winner bid
      await supabase.from('bids').update({ status: 'won' })
        .eq('project_id', projectId)
        .eq('supplier_id', winnerProfile.id);

      // Update loser bids (stranded bids)
      await supabase.from('bids').update({ status: 'rejected' })
        .eq('project_id', projectId)
        .neq('supplier_id', winnerProfile.id);
        
      syncedCount++;
    }

    console.log(`Successfully synced ${syncedCount} projects.`);

  } catch (error) {
    console.error('Cron sync error:', error);
  } finally {
    isSyncing = false;
  }
}

module.exports = { syncEvents };
