import { check_cred } from '../lib/check';
import { TestCase, testCases } from '../script/testCases';

describe('check_cred', () => {
  Object.entries(testCases).forEach(([id, testCase]: [string, TestCase]) => {
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
  });
});
