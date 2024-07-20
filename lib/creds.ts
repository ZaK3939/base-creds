import 'dotenv/config';
import { txFilter_Any, txFilter_Standard } from './filter';

export const credConfig = {
  1: {
    title: 'Mint a brush to save your art on the canvas',
    credType: 'basic',
    apiChoice: 'etherscan',
    apiKeyOrUrl: process.env.BASESCAN_API_KEY ?? '',
    contractAddress: '0xD68fe5b53e7E1AbeB5A4d0A6660667791f39263a',
    methodId: '0x08dc9f42',
    network: 'basechain',
    startBlock: '0',
    endBlock: 'latest',
    filterFunction: txFilter_Standard,
    transactionCondition: (txs: any[]) => txs.length > 0,
  },
  2: {
    title: 'Buy Wearables on Sofamon',
    credType: 'basic',
    apiChoice: 'etherscan',
    apiKeyOrUrl: process.env.BASESCAN_API_KEY ?? '',
    contractAddress: '0xc32dF201476BB79318C32fd696b2CcDCc5F9A909',
    methodId: '0x6cbef461',
    network: 'basechain',
    startBlock: '0',
    endBlock: 'latest',
    filterFunction: txFilter_Standard,
    transactionCondition: (txs: any[]) => txs.length > 0,
  },
};
