import axios from 'axios';
import { encodeFunctionData, Address, Hex } from 'viem';
import fs from 'fs/promises';
import path from 'path';
import { PHI_API_URL, publicClient, walletClient, PHI_FACTORY_ADDRESS, account } from './config';
import phiFactoryAbi from './abi/factory';
import { AddArtRequest, CreateArtSignature } from '../../lib/types';
import { readSvgAsBase64 } from './utils/file';

const ARTIFACTS_DIR = path.join(process.cwd(), 'script', 'card-generator', 'artifacts');

export async function createArt(credId: number, creator: Address) {
  // if (credId > 23) {
  //   credId = credId % 24;
  // }

  let imageData: string;

  const cardDir = path.join(ARTIFACTS_DIR, 'frontCards', '2024_7_27');
  const files = await fs.readdir(cardDir);
  const cardFile = files[credId];
  console.log('Processing card:', cardFile);
  imageData = await readSvgAsBase64(path.join(cardDir, cardFile));

  const currentDate = new Date();
  const startDate = Math.floor(currentDate.getTime() / 1000);
  const endDate = Math.floor(currentDate.setFullYear(currentDate.getFullYear() + 1) / 1000);

  const artRequest: AddArtRequest = {
    imageData,
    title: `Phi Poker Card #${credId}`,
    description: 'A unique poker card from the Phi Protocol collection.',
    externalURL: 'https://phiprotocol.xyz/',
    start: startDate,
    end: endDate,
    network: 84532, // Base network
    maxSupply: 1000,
    price: 0, // Price in ETH
    soulbound: false,
    receiver: creator,
    artist: creator,
    artType: 'IMAGE',
  };

  console.log('Creating art:', artRequest);
  const endPoint = `${PHI_API_URL}/api/cred/84532/${credId}/art`;
  const response = await axios.post<{ sig: [Hex, Hex, CreateArtSignature] }>(endPoint, artRequest);
  console.log('Art creation response:', response.data);
  const { sig } = response.data;
  const estimatedGas = await publicClient.estimateContractGas({
    address: PHI_FACTORY_ADDRESS as Address,
    abi: phiFactoryAbi,
    functionName: 'createArt',
    account,
    // @ts-ignore
    args: sig,
  });

  const hash = await walletClient.sendTransaction({
    account,
    to: PHI_FACTORY_ADDRESS as Address,
    data: encodeFunctionData({
      abi: phiFactoryAbi,
      functionName: 'createArt',
      args: sig,
    }),
    gas: estimatedGas,
  });

  console.log('Transaction hash:', hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === 'success') {
    console.log('Art created successfully!');
  } else {
    console.error('Art creation failed.');
  }
}
