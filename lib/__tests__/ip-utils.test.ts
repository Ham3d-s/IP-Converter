import {
  validateIPv4,
  validateIPv6,
  ipToBits,
  bitsToIP,
  calculateSubnetDetails,
  calculateMathStepsForIP,
  generateRandomIPv4,
  generateRandomIPv6,
  cidrToMaskNum
} from '../ip-utils';

describe('ip-utils', () => {
  describe('validateIPv4', () => {
    it('should return true for valid IPv4 addresses', () => {
      expect(validateIPv4('192.168.1.1')).toBe(true);
      expect(validateIPv4('0.0.0.0')).toBe(true);
      expect(validateIPv4('255.255.255.255')).toBe(true);
      expect(validateIPv4(' 10.0.0.1 ')).toBe(true); // trims whitespace
    });

    it('should return false for invalid IPv4 addresses', () => {
      expect(validateIPv4('256.1.1.1')).toBe(false);
      expect(validateIPv4('192.168.1')).toBe(false);
      expect(validateIPv4('192.168.1.1.1')).toBe(false);
      expect(validateIPv4('abc.def.ghi.jkl')).toBe(false);
      expect(validateIPv4('192.168.1.1/24')).toBe(false); // CIDR notation
      expect(validateIPv4('')).toBe(false);
    });
  });

  describe('validateIPv6', () => {
    it('should return true for valid IPv6 addresses', () => {
      expect(validateIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(validateIPv6('2001:db8:85a3:0:0:8a2e:370:7334')).toBe(true);
      expect(validateIPv6('::1')).toBe(true);
      expect(validateIPv6('2001:db8::1')).toBe(true);
      expect(validateIPv6('::ffff:192.168.1.1')).toBe(true); // IPv4-mapped IPv6 address
    });

    it('should return false for invalid IPv6 addresses', () => {
      expect(validateIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334:1234')).toBe(false);
      expect(validateIPv6('not:an:ipv6:address')).toBe(false);
      expect(validateIPv6('2001:db8::1g')).toBe(false); // invalid hex char 'g'
      expect(validateIPv6('2001:db8:::1')).toBe(false); // extra colon
      expect(validateIPv6('')).toBe(false);
    });
  });

  describe('ipToBits', () => {
    it('should correctly convert a valid IPv4 address to 32 bits', () => {
      const bits = ipToBits('192.168.1.1');
      expect(bits.length).toBe(32);
      expect(bits.slice(0, 8).join('')).toBe('11000000'); // 192
      expect(bits.slice(8, 16).join('')).toBe('10101000'); // 168
      expect(bits.slice(16, 24).join('')).toBe('00000001'); // 1
      expect(bits.slice(24, 32).join('')).toBe('00000001'); // 1
    });

    it('should return an array of 32 zeros for an invalid IPv4 address', () => {
      const bits = ipToBits('invalid');
      expect(bits.length).toBe(32);
      expect(bits.every(b => b === 0)).toBe(true);
    });
  });

  describe('bitsToIP', () => {
    it('should correctly convert an array of 32 bits to an IPv4 string', () => {
      const bits = [
        1, 1, 0, 0, 0, 0, 0, 0, // 192
        1, 0, 1, 0, 1, 0, 0, 0, // 168
        0, 0, 0, 0, 0, 0, 0, 1, // 1
        0, 0, 0, 0, 0, 0, 0, 1  // 1
      ];
      expect(bitsToIP(bits)).toBe('192.168.1.1');
    });

    it('should return 0.0.0.0 if the bits array is not length 32', () => {
      expect(bitsToIP([1, 1, 0, 0])).toBe('0.0.0.0');
      expect(bitsToIP([])).toBe('0.0.0.0');
    });
  });

  describe('calculateSubnetDetails', () => {
    it('should return invalid subnet details for an invalid IP', () => {
      const details = calculateSubnetDetails('invalid', 24);
      expect(details.class).toBe('ناشناخته');
      expect(details.type).toBe('نامعتبر');
    });

    it('should correctly calculate details for a Class A IP', () => {
      const details = calculateSubnetDetails('10.0.0.1', 24);
      expect(details.class).toBe('A');
      expect(details.type).toBe('خصوصی (شبکه داخلی - RFC 1918)');
      expect(details.subnetMask).toBe('255.255.255.0');
      expect(details.wildcard).toBe('0.0.0.255');
      expect(details.networkID).toBe('10.0.0.0');
      expect(details.broadcast).toBe('10.0.0.255');
      expect(details.hostRange).toBe('10.0.0.1 تا 10.0.0.254');
    });

    it('should correctly calculate details for a Class B IP', () => {
      const details = calculateSubnetDetails('172.16.0.50', 16);
      expect(details.class).toBe('B');
      expect(details.type).toBe('خصوصی (شبکه داخلی - RFC 1918)');
    });

    it('should correctly calculate details for a Class C IP', () => {
      const details = calculateSubnetDetails('192.168.1.50', 26);
      expect(details.class).toBe('C');
      expect(details.type).toBe('خصوصی (شبکه داخلی - RFC 1918)');
      expect(details.subnetMask).toBe('255.255.255.192');
      expect(details.wildcard).toBe('0.0.0.63');
      expect(details.networkID).toBe('192.168.1.0');
      expect(details.broadcast).toBe('192.168.1.63');
      expect(details.hostRange).toBe('192.168.1.1 تا 192.168.1.62');
    });

    it('should correctly calculate details for a Class D IP', () => {
      const details = calculateSubnetDetails('224.0.0.1', 4);
      expect(details.class).toBe('D (مالتی کست / پخش چندگانه)');
    });

    it('should correctly calculate details for a Class E IP', () => {
      const details = calculateSubnetDetails('240.0.0.1', 4);
      expect(details.class).toBe('E (آزمایشگاهی)');
    });

    it('should handle /31 CIDR edge case', () => {
      const details = calculateSubnetDetails('192.168.1.100', 31);
      expect(details.subnetMask).toBe('255.255.255.254');
      expect(details.hostsCount).toBe('۲');
      expect(details.hostRange).toBe('192.168.1.100 تا 192.168.1.101');
    });

    it('should handle /32 CIDR edge case', () => {
      const details = calculateSubnetDetails('192.168.1.100', 32);
      expect(details.subnetMask).toBe('255.255.255.255');
      expect(details.hostsCount).toBe('۱');
      expect(details.hostRange).toBe('192.168.1.100');
    });

    it('should handle loopback address', () => {
      const details = calculateSubnetDetails('127.0.0.1', 8);
      expect(details.class).toBe('A (لوپ‌بک)');
      expect(details.type).toBe('لوپ‌بک (تست داخلی کارت شبکه)');
    });
  });

  describe('calculateMathStepsForIP', () => {
    it('should return empty array for invalid IP', () => {
      expect(calculateMathStepsForIP('invalid')).toEqual([]);
    });

    it('should correctly calculate math steps for a valid IP', () => {
      const steps = calculateMathStepsForIP('192.168.1.1');
      expect(steps.length).toBe(4);
      expect(steps[0].octetValue).toBe(192);
      const firstOctetSteps = steps[0].steps;
      expect(firstOctetSteps.length).toBe(8); // 8 bits
      
      // 192 >= 128 -> yes
      expect(firstOctetSteps[0].bit).toBe(1);
      expect(firstOctetSteps[0].remainder).toBe(64);
      
      // 64 >= 64 -> yes
      expect(firstOctetSteps[1].bit).toBe(1);
      expect(firstOctetSteps[1].remainder).toBe(0);
      
      // 0 >= 32 -> no
      expect(firstOctetSteps[2].bit).toBe(0);
      expect(firstOctetSteps[2].remainder).toBe(0);
    });
  });

  describe('generateRandomIPv4', () => {
    it('should generate a valid IPv4 address', () => {
      const ip = generateRandomIPv4();
      expect(validateIPv4(ip)).toBe(true);
    });

    it('should generate different IPv4 addresses on subsequent calls', () => {
      const addresses = Array.from({ length: 100 }, () => generateRandomIPv4());
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(addresses.length);
    });
  });

  describe('generateRandomIPv6', () => {
    it('should generate a valid IPv6 address', () => {
      const ip = generateRandomIPv6();
      expect(validateIPv6(ip)).toBe(true);
    });

    it('should generate different IPv6 addresses on subsequent calls', () => {
      const addresses = Array.from({ length: 100 }, () => generateRandomIPv6());
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(addresses.length);
    });
  });

  describe('cidrToMaskNum', () => {
    it('should handle CIDR 0', () => {
      expect(cidrToMaskNum(0)).toBe(0);
    });

    it('should handle standard CIDR masks', () => {
      expect(cidrToMaskNum(24)).toBe(0xffffff00); // 255.255.255.0
      expect(cidrToMaskNum(8)).toBe(0xff000000);  // 255.0.0.0
      expect(cidrToMaskNum(32)).toBe(0xffffffff); // 255.255.255.255
    });
  });
});
