import { encodeBase58Check, decodeBase58Check } from "./Base58";
import { combineLE } from "./BufferUtil";

/**
 * Generates the base58check encoded address for a P2PKH address.
 * It accepts the hash of an SEC encoded point. The hash can either
 * be from the compressed or uncompressed value.
 *
 * Mainnet prefix 0x00 addresses start with a 1 in Base58
 * Testnet prefix 0x6f addresses start with a m in Base58
 *
 * @param testnet default is false
 */
export function p2pkhAddress(h160: Buffer, testnet: boolean = false) {
  const prefix = testnet ? 0x6f : 0x00;
  return encodeBase58Check(combineLE(prefix, h160));
}

/**
 * Generates a base58check encoded address for a P2SH address.
 * It accepts the hash of a serialized Script that is the redeemScript
 * for the P2SH transaction.
 *
 * Mainnet prefix 0x05 addresses start with a 3 in Base58
 * Testnet prefix 0xc4 addresses start with a 2 in Base58
 *
 * @param testnet default is false
 */
export function p2shAddress(h160: Buffer, testnet: boolean = false) {
  const prefix = testnet ? 0xc4 : 0x05;
  return encodeBase58Check(combineLE(prefix, h160));
}

/**
 * Decodes an address, where the first byte is the prefix.
 * @param input base58check address
 */
export function decodeAddress(input: string): { prefix: bigint; hash: Buffer } {
  const all = decodeBase58Check(input);
  return {
    prefix: BigInt(all[0]),
    hash: all.slice(1),
  };
}
