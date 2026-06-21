/**
 * IP Plus 2.0 Subnetting and Math Utilities
 * Isolated, pure, highly-typed mathematical and network calculations.
 */

export interface SubnetDetails {
  class: string;
  type: string;
  subnetMask: string;
  wildcard: string;
  networkID: string;
  broadcast: string;
  hostsCount: string;
  hostRange: string;
}

export interface MathDivisionStep {
  power: number;
  comparison: string;
  bit: number;
  remainder: number;
}

export interface MathStepRecord {
  octetIndex: number;
  octetValue: number;
  steps: MathDivisionStep[];
}

export interface QuizQuestion {
  id: string;
  type: 'dec_to_bin' | 'bin_to_dec' | 'cidr_mask' | 'ip_class' | 'custom_ai';
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export interface Flashcard {
  tag: string;
  title: string;
  desc: string;
}

/**
 * Validates whether a string is a standard IPv4 address.
 */
export function validateIPv4(ip: string): boolean {
  const pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return pattern.test(ip.trim());
}

/**
 * Validates whether a string is a valid IPv6 address (simplified regex).
 */
export function validateIPv6(ip: string): boolean {
  const pattern = /^(?:(?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return pattern.test(ip.trim());
}

/**
 * Converts an IPv4 string to an array of 32 bits (0 or 1).
 */
export function ipToBits(ip: string): number[] {
  if (!validateIPv4(ip)) {
    return new Array(32).fill(0);
  }
  const octets = ip.split('.').map(Number);
  const bits: number[] = [];
  octets.forEach((oct) => {
    const binStr = oct.toString(2).padStart(8, '0');
    for (let i = 0; i < 8; i++) {
      bits.push(parseInt(binStr[i], 10));
    }
  });
  return bits;
}

/**
 * Converts an array of 32 bits (0 or 1) back to an IPv4 string representation.
 */
export function bitsToIP(bits: number[]): string {
  if (bits.length !== 32) return '0.0.0.0';
  const octets: number[] = [];
  for (let i = 0; i < 4; i++) {
    const start = i * 8;
    const end = start + 8;
    const binStr = bits.slice(start, end).join('');
    octets.push(parseInt(binStr, 2));
  }
  return octets.join('.');
}

/**
 * Computes subnet details (mask, wildcard, netID, broadcast, host counts, host ranges)
 * for a given IP address and CIDR prefix. Prevents 32-bit arithmetic overflow in JS.
 */
export function calculateSubnetDetails(ip: string, cidr: number): SubnetDetails {
  if (!validateIPv4(ip)) {
    return {
      class: 'ناشناخته',
      type: 'نامعتبر',
      subnetMask: '0.0.0.0',
      wildcard: '255.255.255.255',
      networkID: '0.0.0.0',
      broadcast: '0.0.0.0',
      hostsCount: '0',
      hostRange: 'نامعتبر',
    };
  }

  const octets = ip.split('.').map(Number);
  
  // Create subnet mask octets safely
  const maskOctets = [0, 0, 0, 0];
  let tempCidr = cidr;
  for (let i = 0; i < 4; i++) {
    if (tempCidr >= 8) {
      maskOctets[i] = 255;
      tempCidr -= 8;
    } else if (tempCidr > 0) {
      maskOctets[i] = 256 - Math.pow(2, 8 - tempCidr);
      tempCidr = 0;
    } else {
      maskOctets[i] = 0;
    }
  }
  const subnetMask = maskOctets.join('.');

  // Create wildcard octets
  const wildcardOctets = maskOctets.map((o) => 255 - o);
  const wildcard = wildcardOctets.join('.');

  // Calculate Network ID (bitwise AND)
  const netOctets = octets.map((o, idx) => o & maskOctets[idx]);
  const networkID = netOctets.join('.');

  // Calculate Broadcast ID (bitwise OR)
  const broadcastOctets = octets.map((o, idx) => o | wildcardOctets[idx]);
  const broadcast = broadcastOctets.join('.');

  // Calculate assignable hosts counts
  let hostsCountNum = 0;
  if (cidr < 31) {
    hostsCountNum = Math.pow(2, 32 - cidr) - 2;
  } else if (cidr === 31) {
    hostsCountNum = 2; // Point-to-point links (RFC 3021)
  } else {
    hostsCountNum = 1; // Single host /32
  }
  const hostsCount = hostsCountNum.toLocaleString('fa-IR');

  // Compute host range
  let hostRange = '';
  if (cidr < 31) {
    const firstHost = [...netOctets];
    firstHost[3] += 1;
    
    const lastHost = [...broadcastOctets];
    lastHost[3] -= 1;
    
    hostRange = `${firstHost.join('.')} تا ${lastHost.join('.')}`;
  } else if (cidr === 31) {
    hostRange = `${networkID} تا ${broadcast}`;
  } else {
    hostRange = ip;
  }

  // Determine IPv4 Class
  const firstOctet = octets[0];
  let ipClass = 'ناشناخته';
  let ipType = 'عمومی (جهانی - Public)';

  if (firstOctet >= 1 && firstOctet <= 126) {
    ipClass = 'A';
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    ipClass = 'B';
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    ipClass = 'C';
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    ipClass = 'D (مالتی کست / پخش چندگانه)';
  } else if (firstOctet >= 240 && firstOctet <= 255) {
    ipClass = 'E (آزمایشگاهی)';
  }

  if (firstOctet === 127) {
    ipClass = 'A (لوپ‌بک)';
    ipType = 'لوپ‌بک (تست داخلی کارت شبکه)';
  }

  // RFC 1918 checking for private IP space
  if (
    firstOctet === 10 ||
    (firstOctet === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (firstOctet === 192 && octets[1] === 168)
  ) {
    ipType = 'خصوصی (شبکه داخلی - RFC 1918)';
  }

  return {
    class: ipClass,
    type: ipType,
    subnetMask,
    wildcard,
    networkID,
    broadcast,
    hostsCount,
    hostRange,
  };
}

/**
 * Triggers full mathematical division steps for consecutive powers of 2 (subtract method).
 */
export function calculateMathStepsForIP(ip: string): MathStepRecord[] {
  if (!validateIPv4(ip)) return [];
  const octets = ip.split('.').map(Number);
  const powers = [128, 64, 32, 16, 8, 4, 2, 1];

  return octets.map((octetValue, octetIndex) => {
    let remainder = octetValue;
    const steps: MathDivisionStep[] = [];

    powers.forEach((p) => {
      const isPassed = remainder >= p;
      const prevRemainder = remainder;
      if (isPassed) {
        remainder -= p;
        steps.push({
          power: p,
          comparison: `${prevRemainder} ≥ ${p} (بله)`,
          bit: 1,
          remainder,
        });
      } else {
        steps.push({
          power: p,
          comparison: `${prevRemainder} ≥ ${p} (خیر)`,
          bit: 0,
          remainder,
        });
      }
    });

    return {
      octetIndex,
      octetValue,
      steps,
    };
  });
}

/**
 * Generates a completely randomized valid IPv4 Address.
 */
export function generateRandomIPv4(): string {
  const o1 = Math.floor(Math.random() * 254) + 1; // avoid 0
  const o2 = Math.floor(Math.random() * 256);
  const o3 = Math.floor(Math.random() * 256);
  const o4 = Math.floor(Math.random() * 256);
  return `${o1}.${o2}.${o3}.${o4}`;
}

/**
 * Generates a completely randomized valid IPv6 Address representation.
 */
export function generateRandomIPv6(): string {
  const blocks: string[] = [];
  for (let i = 0; i < 8; i++) {
    blocks.push(Math.floor(Math.random() * 65536).toString(16));
  }
  return blocks.join(':');
}

/**
 * Converts a CIDR number to an array format mask for internal math operations.
 */
export function cidrToMaskNum(cidr: number): number {
  return cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
}
