import { ipToBits } from '../../lib/ip-utils';

describe('ipToBits', () => {
  it('should return 32 zeros for invalid IP', () => {
    expect(ipToBits('invalid_ip')).toEqual(new Array(32).fill(0));
    expect(ipToBits('999.999.999.999')).toEqual(new Array(32).fill(0));
  });

  it('should convert 0.0.0.0 to 32 zeros', () => {
    expect(ipToBits('0.0.0.0')).toEqual(new Array(32).fill(0));
  });

  it('should convert 255.255.255.255 to 32 ones', () => {
    expect(ipToBits('255.255.255.255')).toEqual(new Array(32).fill(1));
  });

  it('should convert a typical IP address correctly', () => {
    // 192.168.1.1
    // 192 = 11000000
    // 168 = 10101000
    // 1   = 00000001
    // 1   = 00000001
    const expected = [
      1, 1, 0, 0, 0, 0, 0, 0,
      1, 0, 1, 0, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 1
    ];
    expect(ipToBits('192.168.1.1')).toEqual(expected);
  });
});
