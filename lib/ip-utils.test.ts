import { bitsToIP } from './ip-utils';

describe('bitsToIP', () => {
  it('should convert standard 32-bit arrays to correct IPv4 strings', () => {
    // 192.168.1.1
    // 192 = 11000000, 168 = 10101000, 1 = 00000001, 1 = 00000001
    const ip1Bits = [
      1, 1, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1
    ];
    expect(bitsToIP(ip1Bits)).toBe('192.168.1.1');

    // 10.0.0.1
    // 10 = 00001010, 0 = 00000000, 0 = 00000000, 1 = 00000001
    const ip2Bits = [
      0, 0, 0, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1
    ];
    expect(bitsToIP(ip2Bits)).toBe('10.0.0.1');
  });

  it('should correctly handle all zeros (0.0.0.0)', () => {
    const allZeroBits = new Array(32).fill(0);
    expect(bitsToIP(allZeroBits)).toBe('0.0.0.0');
  });

  it('should correctly handle all ones (255.255.255.255)', () => {
    const allOneBits = new Array(32).fill(1);
    expect(bitsToIP(allOneBits)).toBe('255.255.255.255');
  });

  it('should return 0.0.0.0 for arrays with less than 32 bits', () => {
    const shortBits = new Array(31).fill(1);
    expect(bitsToIP(shortBits)).toBe('0.0.0.0');
  });

  it('should return 0.0.0.0 for arrays with more than 32 bits', () => {
    const longBits = new Array(33).fill(1);
    expect(bitsToIP(longBits)).toBe('0.0.0.0');
  });

  it('should return 0.0.0.0 for empty arrays', () => {
    expect(bitsToIP([])).toBe('0.0.0.0');
  });
});
