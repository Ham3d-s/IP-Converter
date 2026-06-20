import { describe, it, expect } from 'vitest';
import { generateRandomIPv4 } from '../lib/ip-utils';

describe('generateRandomIPv4', () => {
  it('should generate a valid IPv4 string', () => {
    const ip = generateRandomIPv4();
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);

    expect(match).toBeTruthy();

    if (match) {
      const [, o1, o2, o3, o4] = match;

      // Check ranges
      expect(Number(o1)).toBeGreaterThanOrEqual(1);
      expect(Number(o1)).toBeLessThanOrEqual(254);
      expect(Number(o2)).toBeGreaterThanOrEqual(0);
      expect(Number(o2)).toBeLessThanOrEqual(255);
      expect(Number(o3)).toBeGreaterThanOrEqual(0);
      expect(Number(o3)).toBeLessThanOrEqual(255);
      expect(Number(o4)).toBeGreaterThanOrEqual(0);
      expect(Number(o4)).toBeLessThanOrEqual(255);
    }
  });

  it('should not generate an IP starting with 0', () => {
    // Run multiple times to ensure randomness doesn't hit 0
    for (let i = 0; i < 100; i++) {
      const ip = generateRandomIPv4();
      expect(ip.startsWith('0.')).toBe(false);
    }
  });
});