import { polygonAmoy, localhost } from "viem/chains";

export const activeChain = process.env.NEXT_PUBLIC_CHAIN === 'localhost' ? localhost : polygonAmoy;
