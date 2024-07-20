import { check_cred } from '../lib/check';
import { credConfig } from '../lib/creds';

describe('check_cred', () => {
  const testCases = {
    0: {
      title: credConfig[0].title,
      addresses: {
        valid: '0x5037e7747fAa78fc0ECF8DFC526DcD19f73076ce',
      },
      expectedDataCheck: (data: string) => parseInt(data) > 311,
    },
    1: {
      title: credConfig[1].title,
      addresses: {
        valid: '0x81a8887980DAcb896F0b5ECe068101014a417C1e',
        invalid: '0xb7Caa0ed757bbFaA208342752C9B1c541e36a4b9',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    2: {
      title: credConfig[2].title,
      addresses: {
        valid: '0x185F1127aD9606C6C5EEaB8891ae2B1fc2019Ba4',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    3: {
      title: credConfig[3].title,
      addresses: {
        valid: '0x5037e7747fAa78fc0ECF8DFC526DcD19f73076ce',
        invalid: '0x32B8E1AE0af3F8f335F59A191617aB7A0885f6a0',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    4: {
      title: credConfig[4].title,
      addresses: {
        valid: '0x32ad053c13699253A95ABAea54b8708905f154Bc',
        invalid: '0x0987654321098765432109876543210987654321',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    5: {
      title: credConfig[5].title,
      addresses: {
        valid: '0x5037e7747fAa78fc0ECF8DFC526DcD19f73076ce',
        invalid: '0x0987654321098765432109876543210987654321',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    6: {
      title: credConfig[6].title,
      addresses: {
        valid: '0x5037e7747fAa78fc0ECF8DFC526DcD19f73076ce',
        invalid: '0x0987654321098765432109876543210987654321',
      },
      expectedDataCheck: (data: string) => data === '',
    },
    7: {
      title: credConfig[7].title,
      addresses: {
        valid: '0x5037e7747fAa78fc0ECF8DFC526DcD19f73076ce',
        invalid: '0x0987654321098765432109876543210987654321',
      },
      expectedDataCheck: (data: string) => data === '',
    },
  };

  Object.entries(testCases).forEach(([id, { title, addresses, expectedDataCheck }]) => {
    describe(`for id ${id}: ${title}`, () => {
      it('should return true and correct data for valid address', async () => {
        const [result, data] = await check_cred(addresses.valid, parseInt(id));
        expect(result).toBe(true);
        expect(expectedDataCheck(data)).toBe(true);
      });

      if ('invalid' in addresses) {
        it('should return false and empty data for invalid address', async () => {
          const [result, data] = await check_cred(addresses.invalid, parseInt(id));
          expect(result).toBe(false);
          expect(data).toBe('');
        });
      }
    });
  });
});
