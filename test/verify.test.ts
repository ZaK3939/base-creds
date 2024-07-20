import { check_cred } from '../lib/check';
import { credConfig } from '../lib/creds';

describe('check_cred', () => {
  const testCases = {
    1: {
      title: credConfig[1].title,
      addresses: {
        valid: '0x81a8887980DAcb896F0b5ECe068101014a417C1e',
        invalid: '0xb7Caa0ed757bbFaA208342752C9B1c541e36a4b9',
      },
      expectedData: '',
    },
    2: {
      title: credConfig[2].title,
      addresses: {
        valid: '0x185F1127aD9606C6C5EEaB8891ae2B1fc2019Ba4',
        invalid: '0x1234567890123456789012345678901234567890',
      },
      expectedData: '',
    },
  };

  Object.entries(testCases).forEach(([id, { title, addresses, expectedData }]) => {
    describe(`for id ${id}: ${title}`, () => {
      it('should return true and correct data for valid address', async () => {
        const [result, data] = await check_cred(addresses.valid, parseInt(id));
        expect(result).toBe(true);
        expect(data).toBe(expectedData);
      });

      it('should return false and empty data for invalid address', async () => {
        const [result, data] = await check_cred(addresses.invalid, parseInt(id));
        expect(result).toBe(false);
        expect(data).toBe('');
      });
    });
  });
});
