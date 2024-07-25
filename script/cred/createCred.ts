import axios from 'axios';
import { encodeFunctionData, isAddress, Address, Hex } from 'viem';
import fs from 'fs';
import path from 'path';
import { credConfig } from '../../lib/creds';
import { testCases } from './testCases';
import { SignatureRequest, CredType, MerkleRequest } from '../../lib/types';
import { VERIFIER_URL, PHI_API_URL, publicClient, walletClient, CRED_CONTRACT_ADDRESS, account } from './config';
import { verifySignature } from './utils/signature';
import { fetchVerifierInfo } from './utils/verifier';
import credContractAbi from '../abi/cred';
import { readCSVFile, readImageAsBase64 } from './utils/file';
import { exportFromDune } from './utils/exportFromDune';

export async function createCredRequest(creator: Address, configId: number) {
  const config = credConfig[configId];
  if (!config) {
    throw new Error(`Config not found for ID: ${configId}`);
  }
  const testCase = testCases[configId];
  if (!testCase) {
    throw new Error(`Test case not found for ID: ${configId}`);
  }

  const base64Image = await readImageAsBase64(configId);

  const baseRequest = {
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
  };

  let request: SignatureRequest | MerkleRequest;
  let signCreateData: string;
  let signature: string;

  if (config.verificationType === 'SIGNATURE') {
    const testAddress = testCase.addresses.valid;
    const verifierEndpoint = `${VERIFIER_URL}${configId}?address=${testAddress}`;
    const schema = await fetchVerifierInfo(verifierEndpoint);
    if (schema.data == null && config.credType == 'ADVANCED') {
      throw new Error('Invalid schema');
    }
    const verifierAddress = verifySignature(testAddress, schema.data ?? 0, schema.signature);
    console.log('Verifier address:', verifierAddress);
    if (!isAddress(verifierAddress)) {
      throw new Error(`Invalid recovered verifier address: ${verifierAddress}`);
    }

    request = {
      ...baseRequest,
      verificationType: 'SIGNATURE',
      verifier: {
        address: verifierAddress,
        endpoint: `${VERIFIER_URL}${configId}`,
      },
    };

    const response = await axios.post<{ signCreateData: string; signature: string }>(PHI_API_URL, request);
    ({ signCreateData, signature } = response.data);
  } else if (config.verificationType === 'MERKLE') {
    if (config.apiChoice === 'dune') {
      await exportFromDune(config.duneQueryId, config.fileName);
    }
    const addressListPath = path.join(process.cwd(), 'csv', `${configId}.csv`);
    const addressList = await readCSVFile(addressListPath);

    request = {
      ...baseRequest,
      verificationType: 'MERKLE',
      addressList,
    };

    const response = await axios.post<{ signCreateData: string; signature: string }>(PHI_API_URL, request);
    ({ signCreateData, signature } = response.data);
  } else {
    throw new Error(`Unsupported verification type: ${config.verificationType}`);
  }

  const signalRoyalty = 100;
  const unSignalRoyalty = 100;

  const args: [Address, Hex, Hex, number, number] = [
    creator,
    signCreateData as Hex,
    signature as Hex,
    signalRoyalty,
    unSignalRoyalty,
  ];

  const buyPrice = await publicClient.readContract({
    address: CRED_CONTRACT_ADDRESS as Address,
    abi: credContractAbi,
    functionName: 'getCredBuyPriceWithFee',
    args: [BigInt(1), BigInt(1)],
  });

  const estimatedGas = await publicClient.estimateContractGas({
    address: CRED_CONTRACT_ADDRESS as Address,
    abi: credContractAbi,
    functionName: 'createCred',
    account,
    args,
    value: buyPrice,
  });

  const hash = await walletClient.sendTransaction({
    account,
    to: CRED_CONTRACT_ADDRESS as Address,
    value: buyPrice,
    data: encodeFunctionData({
      abi: credContractAbi,
      functionName: 'createCred',
      args,
    }),
    gas: estimatedGas,
  });

  console.log('Transaction hash:', hash);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === 'success') {
    console.log('Cred created successfully!');
  } else {
    console.error('Cred creation failed.');
  }
}
