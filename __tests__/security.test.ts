import { describe, it, expect, vi } from "vitest";
import { encrypt, decrypt, hash, compareHash } from "@/lib/security";

// Mock environment variables
vi.stubEnv("TOKEN_ENCRYPTION_KEY", "12345678901234567890123456789012"); // 32 chars

describe("Security Utils", () => {
  it("should encrypt and decrypt text correctly", () => {
    const original = "my-secret-token";
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
    expect(encrypted).not.toBe(original);
  });

  it("should hash and compare passwords correctly", async () => {
    const password = "password123";
    const hashedPassword = await hash(password);
    const isValid = await compareHash(password, hashedPassword);
    expect(isValid).toBe(true);
    expect(hashedPassword).not.toBe(password);
  });

  it("should fail comparison for wrong password", async () => {
    const password = "password123";
    const hashedPassword = await hash(password);
    const isValid = await compareHash("wrongpassword", hashedPassword);
    expect(isValid).toBe(false);
  });
});
