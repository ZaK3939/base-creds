import { Address } from 'viem';
import { createCredRequest } from './createCred';
import { createArt } from './createArt';

async function main() {
  const creator: Address = '0x5037e7747faa78fc0ecf8dfc526dcd19f73076ce';
  console.log(`Processing creator: ${creator} with CRED contract ${process.env.CRED_CONTRACT_ADDRESS}`);
  for (let configId = 0; configId <= 23; configId++) {
    try {
      console.log(`Processing configId: ${configId}`);

      let id = await createCredRequest(creator, configId);
      console.log(`Successfully processed configId: ${configId} with credID: ${id}`);
      // make sleep for 1 second
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await createArt(Number(id), creator);
      console.log(`Successfully processed createArt for credID: ${id}`);
    } catch (error) {
      console.error(`Error processing configId ${configId}:`, error);
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main()
  .then(() => console.log('All processing completed.'))
  .catch((error) => console.error('Error in main process:', error));
