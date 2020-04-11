import crypto from "crypto";

/**
 * Performs a sha256 hash followed by a ripemd160 hash
 * @param buf
 */
export function hash160(buf: Buffer): Buffer {
  return crypto
    .createHash("ripemd160")
    .update(crypto.createHash("sha256").update(buf).digest())
    .digest();
}
