import dotenv from 'dotenv';
import { createPublicClient, http, createWalletClient, Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

dotenv.config();

export const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
export const CRED_CONTRACT_ADDRESS = process.env.CRED_CONTRACT_ADDRESS;
export const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://rpc.ankr.com/base_sepolia';
export const PHI_API_URL = process.env.PHI_API_URL || 'https://base-sepolia.terminal.phiprotocol.xyz/api/cred/84532';
export const VERIFIER_URL = process.env.VERIFIER_URL || 'https://base-creds.vercel.app/api/verify/';

if (!SIGNER_PRIVATE_KEY || !CRED_CONTRACT_ADDRESS || !BASE_RPC_URL) {
  throw new Error('SIGNER_PRIVATE_KEY, CRED_CONTRACT_ADDRESS, and BASE_RPC_URL must be set in .env file');
}

export const account = privateKeyToAccount(SIGNER_PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia as Chain,
  transport: http(BASE_RPC_URL),
});

export const publicClient = createPublicClient({
  chain: baseSepolia as Chain,
  transport: http(BASE_RPC_URL),
});
