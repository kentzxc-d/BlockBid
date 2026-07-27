import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { polygonAmoy } from 'viem/chains';

async function main() {
  const account = privateKeyToAccount('0xf0cb6ceac8c09f72e387e198741866509dc70eefe75053d42a0fab3d0c35348c');
  const client = createWalletClient({
    account,
    chain: polygonAmoy,
    transport: http('https://polygon-amoy-bor-rpc.publicnode.com')
  });

  console.log("Sending POL to user...");
  const tx = await client.sendTransaction({
    to: '0xf420986c72d71809807e60c79fE25D33DB23025A',
    value: parseEther('0.05')
  });
  console.log("Tx Hash:", tx);
}
main();
