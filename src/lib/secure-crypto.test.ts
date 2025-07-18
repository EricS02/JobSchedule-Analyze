import { encrypt, decrypt, SecureCryptoError } from "./secure-crypto";

describe("secure-crypto", () => {
  const originalKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it("encrypts and decrypts correctly", () => {
    const secret = "my super secret";
    const encrypted = encrypt(secret);
    expect(typeof encrypted).toBe("string");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(secret);
  });

  it("throws on tampered data", () => {
    const encrypted = encrypt("test");
    // Tamper with ciphertext
    const parts = encrypted.split(":");
    parts[2] = Buffer.from("tampered").toString("base64");
    expect(() => decrypt(parts.join(":"))).toThrow(SecureCryptoError);
  });

  it("throws on wrong key", () => {
    const encrypted = encrypt("test");
    process.env.ENCRYPTION_KEY = "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    expect(() => decrypt(encrypted)).toThrow(SecureCryptoError);
    // Restore key
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it("throws on malformed payload", () => {
    expect(() => decrypt("not:enough:parts:here")).toThrow(SecureCryptoError);
  });

  it("validates key length", () => {
    process.env.ENCRYPTION_KEY = "short";
    expect(() => encrypt("fail")).toThrow(SecureCryptoError);
    // Restore key
    process.env.ENCRYPTION_KEY = originalKey;
  });
}); 