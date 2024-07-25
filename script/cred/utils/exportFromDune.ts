// src/exportFromDune.ts

import { DuneClient } from '@cowprotocol/ts-dune-client';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export async function exportFromDune(queryID: number, fileName: string): Promise<void> {
  const duneApiKey = process.env.DUNE_API_KEY;
  if (!duneApiKey) {
    throw new Error('DUNE_API_KEY is not defined in the environment variables');
  }

  const client = new DuneClient(duneApiKey);

  try {
    const executeResult = await client.refresh(queryID);

    if (executeResult.state !== 'QUERY_STATE_COMPLETED') {
      throw new Error(`Query execution failed or is still pending. State: ${executeResult.state}`);
    }

    if (!executeResult.result || !executeResult.result.rows) {
      throw new Error('Query executed successfully but returned no data');
    }

    const data = executeResult.result.rows
      .map((row) => {
        // Assuming the field is named 'address'. Adjust if different.
        return `${row.address}`;
      })
      .join('\n');

    const csvData = ['address', ...data.split('\n')].join('\n');

    const outputDir = path.join(process.cwd(), 'csv');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputFile = path.join(outputDir, fileName);

    fs.writeFileSync(outputFile, csvData);
    console.log(`Exported data saved to: ${outputFile}`);
  } catch (error) {
    console.error('Error exporting data from Dune:', error);
    throw error;
  }
}
