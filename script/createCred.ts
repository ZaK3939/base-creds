import axios from 'axios';
import { createPublicClient, http, createWalletClient, encodeFunctionData, Hex, Chain, Account, Address } from 'viem';
import credContractAbi from './abi/cred';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { credConfig } from '../lib/creds';
import { SignatureRequest, CredType } from '../lib/types';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://rpc.ankr.com/base_sepolia';
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
const CRED_CONTRACT_ADDRESS = process.env.CRED_CONTRACT_ADDRESS;
const PHI_API_URL = process.env.PHI_API_URL || 'https://base-sepolia.terminal.phiprotocol.xyz/api/cred/84532';
const VERIFIER_ADDRESS = process.env.VERIFIER_ADDRESS || '0x29c76e6ad8f28bb1004902578fb108c507be341b';
const VERIFIER_URL = process.env.VERIFIER_URL || 'https://base-creds.vercel.app/api/verify/';

if (!SIGNER_PRIVATE_KEY || !CRED_CONTRACT_ADDRESS || !BASE_RPC_URL) {
  throw new Error('SIGNER_PRIVATE_KEY, CRED_CONTRACT_ADDRESS, and BASE_RPC_URL must be set in .env file');
}

const account = privateKeyToAccount(SIGNER_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: baseSepolia as Chain,
  transport: http(BASE_RPC_URL),
});

const publicClient = createPublicClient({
  chain: baseSepolia as Chain,
  transport: http(BASE_RPC_URL),
});

async function getSignature(configId: number): Promise<{ signCreateData: string; signature: string }> {
  const config = credConfig[configId];
  if (!config) {
    throw new Error(`Config not found for ID: ${configId}`);
  }

  // Load and convert image to Base64
  const imagePath = path.join(process.cwd(), 'images', `${configId}.png`);
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const request: SignatureRequest = {
    credType: config.credType as CredType,
    requirement: config.title,
    imageData: base64Image,
    verificationSource: `https://github.com/ZaK3939/base-creds`,
    title: config.title,
    description: config.description,
    networks: [8453],
    project: config.project,
    tags: config.tags,
    relatedLinks: config.relatedLinks,
    verificationType: 'SIGNATURE',
    verifier: {
      address: VERIFIER_ADDRESS as `0x${string}`,
      endpoint: `${VERIFIER_URL}${configId}`,
    },
  };

  try {
    const response = await axios.post<{ signCreateData: string; signature: string }>(PHI_API_URL, request);
    return response.data;
  } catch (error) {
    console.error('Error getting signature:', error);
    throw error;
  }
}

async function createCredRequest(configId: number) {
  const { signCreateData, signature } = await getSignature(configId);

  const creator: Address = '0x5037e7747faa78fc0ecf8dfc526dcd19f73076ce';
  const signalRoyalty = 100;
  const unSignalRoyalty = 100;

  const args: [`0x${string}`, `0x${string}`, `0x${string}`, number, number] = [
    creator,
    signCreateData as `0x${string}`,
    signature as `0x${string}`,
    signalRoyalty,
    unSignalRoyalty,
  ];

  const buyPrice = await publicClient.readContract({
    address: CRED_CONTRACT_ADDRESS as `0x${string}`,
    abi: credContractAbi,
    functionName: 'getCredBuyPriceWithFee',
    args: [BigInt(1), BigInt(1)],
  });

  const estimatedGas = await publicClient.estimateContractGas({
    address: CRED_CONTRACT_ADDRESS as `0x${string}`,
    abi: credContractAbi,
    functionName: 'createCred',
    account: account as Account,
    args: args,
    value: buyPrice,
  });

  try {
    // Create credential by calling createCredential function
    const hash = await walletClient.sendTransaction({
      account,
      to: CRED_CONTRACT_ADDRESS as `0x${string}`,
      value: buyPrice,
      data: encodeFunctionData({
        abi: credContractAbi,
        functionName: 'createCred',
        args,
      }),
      chain: baseSepolia,
      gas: estimatedGas,
    });

    console.log('Transaction hash:', hash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      console.log('Cred created successfully!');
    } else {
      console.error('Cred creation failed.');
    }
  } catch (txError) {
    console.error('Transaction failed:', txError);
  }
}

async function main() {
  for (let configId = 0; configId <= 22; configId++) {
    try {
      console.log(`Processing configId: ${configId}`);
      await createCredRequest(configId);
      console.log(`Successfully processed configId: ${configId}`);
    } catch (error) {
      console.error(`Error processing configId ${configId}:`, error);
    }

    // Wait for 1 second between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main()
  .then(() => console.log('All processing completed.'))
  .catch((error) => console.error('Error in main process:', error));
