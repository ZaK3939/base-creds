import { Address, Chain, Hex } from 'viem';

export type EtherscanFilter = (a: EtherscanTxItem) => boolean;

export type GeneralTxItem = {
  hash: string;
  from: string;
  to: string;
  blockNumber: string;
  methodId?: string; // For Etherscan's transaction data
  isError?: string; // This might be specific to Etherscan
  input?: string; // For Alchemy's transaction data
};

export type TxFilterFunction = {
  (tx: GeneralTxItem, contractAddress: string, methodId: string): boolean;
};

export type EtherscanTxItem = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
};

export type EtherscanResponse = {
  status: string;
  message: string;
  result: EtherscanTxItem[];
};

export type AlchemyTxItem = {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  erc721TokenId?: string;
  erc1155Metadata?: any; // Adjust type based on actual structure
  tokenId?: string;
  asset: string;
  category: string;
  rawContract: {
    value: string;
    address?: string;
    decimal: string;
  };
};

export type AlchemyDetailTxItem = {
  blockHash: string;
  blockNumber: string;
  hash: string;
  transactionIndex: string;
  type: string;
  nonce: string;
  input: string;
  r: string;
  s: string;
  chainId: string;
  v: string;
  gas: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
};

export type AlchemyResponse = {
  jsonrpc: string;
  id: number;
  result: {
    transfers: AlchemyTxItem[];
  };
};

export type AlchemyResponseForTxDetails = {
  jsonrpc: string;
  id: number;
  result: AlchemyDetailTxItem;
};

export type CredType = 'BASIC' | 'ADVANCED';
export type VerificationType = 'MERKLE' | 'SIGNATURE';

export type BaseCredRequest = {
  credType: CredType;
  requirement: string;
  imageData: string;
  verificationSource: string;
  title?: string;
  description?: string;
  networks?: Chain['id'][];
  project?: string;
  tags?: string[];
  relatedLinks?: string[];
};

export type SignatureRequest = BaseCredRequest & {
  verificationType: 'SIGNATURE';
  verifier: {
    address: `0x${string}`;
    endpoint: string;
  };
};

export type MerkleRequest = BaseCredRequest & {
  verificationType: 'MERKLE';
  addressList: string;
};

export type VerifierResponse = {
  signature: string;
  mint_eligibility: boolean;
  data?: string | number;
};

export type CredConfig = {
  title: string;
  description: string;
  credType: CredType;
  verificationType: VerificationType;
  project: string;
  tags: string[];
  relatedLinks: string[];
};

export type BaseArtRequest = {
  title: string;
  network: number;
  artist: `0x${string}`;
  receiver: `0x${string}`;
  description?: string;
  externalURL?: string;
  start: number;
  end: number;
  maxSupply?: number;
  price: number;
  soulbound: boolean;
  artType: ArtType;
};

export type EligibleRequest = BaseArtRequest & {
  imageData: string; // base64 encoded
};
export type NumericRequest = BaseArtRequest & {
  endpoint: string;
  previewInput: { address: string; data: string };
};

export type AddArtRequest = EligibleRequest | NumericRequest;

export type ArtType = 'IMAGE' | 'API_ENDPOINT';
export interface CreateArtSignature {
  artist: Address;
  receiver: Address;
  endTime: bigint;
  startTime: bigint;
  maxSupply: bigint;
  mintFee: bigint;
  soulBounded: boolean;
}
