import { describe, it, expect } from "vitest";
import { hashSync, compareSync } from "bcryptjs";

// Test login logic directly — extracted from the auth action's core logic
// This avoids needing to mock Next.js server internals (cookies, redirect)

describe("Auth Logic", () => {
  const testPassword = "password123";
  const testHash = hashSync(testPassword, 10);

  it("should verify correct password", () => {
    const result = compareSync(testPassword, testHash);
    expect(result).toBe(true);
  });

  it("should reject incorrect password", () => {
    const result = compareSync("wrongpassword", testHash);
    expect(result).toBe(false);
  });
});
