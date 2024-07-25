import { check_cred } from '../lib/check';
import { credConfig } from '../lib/creds';
import { TestCase, testCases } from '../script/cred/testCases';

describe('check_cred', () => {
  Object.entries(testCases).forEach(([id, testCase]: [string, TestCase]) => {
    if (credConfig[parseInt(id)].verificationType !== 'MERKLE') {
      describe(`for id ${id}: ${testCase.title}`, () => {
        it('should return true and correct data for valid address', async () => {
          const [result, data] = await check_cred(testCase.addresses.valid, parseInt(id));
          expect(result).toBe(true);
          expect(testCase.expectedDataCheck(data)).toBe(true);
        });

        if ('invalid' in testCase.addresses) {
          it('should return false and empty data for invalid address', async () => {
            const [result, data] = await check_cred(testCase.addresses.invalid!, parseInt(id));
            expect(result).toBe(false);
            expect(data).toBe('');
          });
        }
      });
    }
  });
});
