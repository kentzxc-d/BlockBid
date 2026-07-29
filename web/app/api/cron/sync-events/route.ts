import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { activeChain } from '@/utils/network';
import { BlockBidABI } from '@/lib/abi';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // 1. Verify CRON_SECRET for security
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Setup viem client to read from Polygon Amoy
    const publicClient = createPublicClient({
      chain: activeChain,
      transport: http() // uses default public RPC, can be replaced with custom RPC if rate limited
    });

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
    if (!contractAddress) {
      throw new Error('Missing NEXT_PUBLIC_CONTRACT_ADDRESS');
    }

    // 3. Fetch recent AwardFinalized events (last 1000 blocks ~ 30 minutes)
    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = currentBlock - 1000n; // look back 1000 blocks

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

    // 4. For each event, check and sync the database
    for (const event of awardEvents) {
      const args = event.args as any;
      if (!args || !args.acquisitionId || !args.supplier) continue;
      
      const projectId = args.acquisitionId;
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

    return NextResponse.json({ success: true, message: `Synced ${syncedCount} projects` });

  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
