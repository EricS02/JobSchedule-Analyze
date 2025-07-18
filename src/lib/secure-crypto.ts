import crypto from "crypto";

/**
 * Custom error for encryption/decryption operations.
 */
export class SecureCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecureCryptoError";
  }
}

/**
 * Loads and validates a 32-byte encryption key from ENCRYPTION_KEY env variable (hex-encoded).
 * Optionally supports KMS fallback (stub for extension).
 */
function loadEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) throw new SecureCryptoError("ENCRYPTION_KEY env variable not set");
  if (keyHex.length !== 64) throw new SecureCryptoError("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * @param plaintext - The string to encrypt.
 * @returns IV:AuthTag:Ciphertext (all base64-encoded, colon-separated)
 */
export function encrypt(plaintext: string): string {
  const key = loadEncryptionKey();
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Output: IV:AuthTag:Ciphertext (all base64)
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

/**
 * Decrypts a payload produced by encrypt().
 * @param encryptedPayload - IV:AuthTag:Ciphertext (all base64-encoded, colon-separated)
 * @returns The decrypted plaintext string.
 */
export function decrypt(encryptedPayload: string): string {
  const key = loadEncryptionKey();
  const [ivB64, tagB64, ctB64] = encryptedPayload.split(":");
  if (!ivB64 || !tagB64 || !ctB64) throw new SecureCryptoError("Malformed encrypted payload");

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  try {
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    throw new SecureCryptoError("Decryption failed (tampered data or wrong key)");
  }
}

/**
 * Example usage: Encrypting a Google OAuth token.
 */
// const encrypted = encrypt("ya29.a0AfH6SM...");
// const decrypted = decrypt(encrypted);

/**
 * Benchmark tool for encryption/decryption performance.
 * @param iterations - Number of encrypt/decrypt cycles.
 */
export function benchmark(iterations = 1000): void {
  const testString = "SensitiveToken123!@#";
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    const enc = encrypt(testString);
    const dec = decrypt(enc);
    if (dec !== testString) throw new Error("Mismatch in benchmark");
  }
  const end = process.hrtime.bigint();
  console.log(
    `AES-256-GCM: ${iterations} cycles in ${(Number(end - start) / 1e6).toFixed(2)} ms`
  );
} 