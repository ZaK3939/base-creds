import { check_cred } from '../lib/check';

describe('check_cred', () => {
  const testCases = [
    {
      description: 'should return true for valid address',
      address: '0x81a8887980DAcb896F0b5ECe068101014a417C1e',
      expectedResult: true,
    },
    {
      description: 'should return false for invalid address',
      address: '0xb7Caa0ed757bbFaA208342752C9B1c541e36a4b9',
      expectedResult: false,
    },
  ];

  testCases.forEach(({ description, address, expectedResult }) => {
    it(description, async () => {
      const id = 1;
      const expectedData = '';

      const [result, data] = await check_cred(address, id);

      expect(result).toBe(expectedResult);
      expect(data).toBe(expectedData);
    });
  });
});
