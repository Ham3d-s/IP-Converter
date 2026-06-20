import { validateIPv4 } from "../../lib/ip-utils";

describe("validateIPv4", () => {
  it("should return true for valid IPv4 addresses", () => {
    // Standard valid cases
    expect(validateIPv4("192.168.1.1")).toBe(true);
    expect(validateIPv4("10.0.0.0")).toBe(true);
    expect(validateIPv4("172.16.254.1")).toBe(true);

    // Boundary cases
    expect(validateIPv4("0.0.0.0")).toBe(true);
    expect(validateIPv4("255.255.255.255")).toBe(true);

    // Trims whitespace
    expect(validateIPv4("  192.168.1.1  ")).toBe(true);
  });

  it("should return false for invalid IPv4 addresses", () => {
    // Out of range octets
    expect(validateIPv4("256.0.0.0")).toBe(false);
    expect(validateIPv4("192.168.1.256")).toBe(false);
    expect(validateIPv4("10.0.0.-1")).toBe(false);

    // Invalid formats
    expect(validateIPv4("192.168.1")).toBe(false); // Too few octets
    expect(validateIPv4("192.168.1.1.1")).toBe(false); // Too many octets
    expect(validateIPv4("192.168..1")).toBe(false); // Missing octet
    expect(validateIPv4("")).toBe(false); // Empty string

    // Text instead of numbers
    expect(validateIPv4("abc.def.ghi.jkl")).toBe(false);
    expect(validateIPv4("192.168.1.a")).toBe(false);

    // IPv6 addresses
    expect(validateIPv4("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(false);
    expect(validateIPv4("::1")).toBe(false);
  });
});
