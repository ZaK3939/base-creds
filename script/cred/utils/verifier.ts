import { isHex } from 'viem';
import { VerifierResponse } from '../../../lib/types';

export function isVerifierResponse(data: any): data is VerifierResponse {
  return typeof data === 'object' && isHex(data.signature) && typeof data.mint_eligibility === 'boolean';
}

export async function fetchVerifierInfo(endpoint: string): Promise<VerifierResponse> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(`Failed to fetch verifier info: ${errorMessage}`);
  }
  const schema = await res.json();
  if (!isVerifierResponse(schema)) {
    throw new Error('Invalid schema');
  }
  return schema;
}
