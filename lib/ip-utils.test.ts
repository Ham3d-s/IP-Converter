import { generateRandomIPv6, validateIPv6 } from './ip-utils';

describe('generateRandomIPv6', () => {
  it('should generate a string with 8 blocks of hex values separated by colons', () => {
    const ipv6 = generateRandomIPv6();
    const blocks = ipv6.split(':');

    expect(blocks).toHaveLength(8);

    blocks.forEach((block) => {
      expect(block).toMatch(/^[0-9a-f]{1,4}$/i);
      const val = parseInt(block, 16);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(65535);
    });
  });

  it('should generate a valid IPv6 address', () => {
    const ipv6 = generateRandomIPv6();
    expect(validateIPv6(ipv6)).toBe(true);
  });

  it('should generate different IPv6 addresses on subsequent calls', () => {
    const ipv6_1 = generateRandomIPv6();
    const ipv6_2 = generateRandomIPv6();
    expect(ipv6_1).not.toBe(ipv6_2);
  });
});
