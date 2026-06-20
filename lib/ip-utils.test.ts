import { cidrToMaskNum } from './ip-utils';

describe('cidrToMaskNum', () => {
  it('should return 0 when cidr is 0', () => {
    expect(cidrToMaskNum(0)).toBe(0);
  });

  it('should return 4294967295 (0xFFFFFFFF) when cidr is 32', () => {
    expect(cidrToMaskNum(32)).toBe(4294967295);
  });

  it('should return 4294967040 (0xFFFFFF00) when cidr is 24', () => {
    expect(cidrToMaskNum(24)).toBe(4294967040);
  });

  it('should return 4294901760 (0xFFFF0000) when cidr is 16', () => {
    expect(cidrToMaskNum(16)).toBe(4294901760);
  });

  it('should return 4278190080 (0xFF000000) when cidr is 8', () => {
    expect(cidrToMaskNum(8)).toBe(4278190080);
  });

  it('should return 2147483648 (0x80000000) when cidr is 1', () => {
    expect(cidrToMaskNum(1)).toBe(2147483648);
  });

  it('should return 4294967294 (0xFFFFFFFE) when cidr is 31', () => {
    expect(cidrToMaskNum(31)).toBe(4294967294);
  });
});
