import type { VercelRequest, VercelResponse } from '@vercel/node';

import { Address } from 'viem';
import { check_cred } from '../../lib/check';
import { create_signature } from '../../lib/signature';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return res.status(400).json({ error: 'ID must be a number' });
  }

  try {
    const [mint_eligibility, data] = await check_cred(address as Address, numericId);
    console.log(`Cred check result for ID ${numericId}: ${mint_eligibility}`);

    const signature = await create_signature(address as Address, mint_eligibility, data);
    console.log(`Signature created for ID ${numericId}: ${signature}`);
    return res.status(200).json({ mint_eligibility, signature, data });
  } catch (error) {
    console.error('Error in verify:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
