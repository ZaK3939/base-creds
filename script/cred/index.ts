import { Address } from 'viem';
import { createCredRequest } from './createCred';
import { createArt } from './createArt';

async function main() {
  const creator: Address = '0x5037e7747faa78fc0ecf8dfc526dcd19f73076ce';

  for (let configId = 0; configId <= 23; configId++) {
    try {
      console.log(`Processing configId: ${configId}`);
      // await createCredRequest(creator, configId);
      const credID = configId + 1;
      await createArt(credID, creator);
      console.log(`Successfully processed configId: ${configId}`);
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
