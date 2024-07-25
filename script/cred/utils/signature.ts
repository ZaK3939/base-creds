import { encodeAbiParameters, parseAbiParameters, keccak256, toHex, toBytes } from 'viem';
import { extractPublicKey } from '@metamask/eth-sig-util';
import { pubToAddress } from '@ethereumjs/util';

export function verifySignature(address: string, data: string | number, signature: string): string {
  const dataHex = toHex(data ?? 0, { size: 32 });
  const encodedData = encodeAbiParameters(parseAbiParameters('address, bool, bytes32'), [
    address as `0x{string}`,
    true,
    dataHex,
  ]);
  const hashBuff = keccak256(toBytes(encodedData));
  const publicKey = extractPublicKey({ data: hashBuff, signature });
  return toHex(pubToAddress(Buffer.from(publicKey.slice(2), 'hex')));
}
