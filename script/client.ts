import { Chain, createPublicClient, http } from 'viem';
import { arbitrumSepolia, baseSepolia, optimismSepolia, sepolia } from 'viem/chains';

const clients = {
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia as Chain, // TODO: fix this
    transport: http('https://rpc.ankr.com/base_sepolia'),
  }),
};

export function getClient(chainId: number) {
  return clients[chainId];
}
