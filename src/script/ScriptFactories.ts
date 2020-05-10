import { Script } from "./Script";
import { OpCode } from "./OpCode";
import { combineLE } from "../util/BufferUtil";
import { ScriptCmd } from "./ScriptCmd";
import { encodeVarint } from "../util/Varint";
import { S256Point } from "../ecc/S256Point";
import { Signature } from "../ecc/Signature";

/**
 * Creates the p2pkh scriptPubKey from a Hash160 of a public key point
 *
 * @remarks
 *  OP_DUP
 *  OP_HASH160
 *  <hash (20-bytes)>
 *  OP_EQUALVERIFY
 *  OP_CHECKSIG
 *
 * @example
 * ```typescript
 * const compress = true;
 * const privkey = new PrivateKey(1n);
 * const point = privkey.point;
 * const h160 = point.hash160(compress);
 * const scriptPubKey = p2pkhScript(h160);
 * ```
 * @param h160
 */
export function p2pkhLock(h160: Buffer): Script {
  return new Script([
    OpCode.OP_DUP,
    OpCode.OP_HASH160,
    h160,
    OpCode.OP_EQUALVERIFY,
    OpCode.OP_CHECKSIG,
  ]);
}

/**
 * Creates a p2pkh scriptSig from a signature and a pubkey
 *
 * @remarks
 *  <sig + 0x01 hash byte>
 *  <pubkey>
 *
 * @example
 * ```typescript
 * const z = Buffer.alloc(32);
 * const compress = true;
 * const privkey = new PrivateKey(1n);
 * const sig = privkey.sign(z);
 * const pubkey = privkey.point;
 * const scriptSig = p2pkhSig(sig.der(), pubkey.sec(compress));
 * ```
 *
 * @param sig DER encoded signature
 * @param pubkey SEC encoded public key in either compressed or uncompressed format
 */
export function p2pkhUnlock(sig: Buffer, pubkey: Buffer): Script {
  return new Script([
    combineLE(sig, 0x01),
    pubkey
  ]); // prettier-ignore
}

/**
 * Creates a p2ms scriptPubKey with the supplied m required of n total pubkeys.
 *
 * @remarks
 *  OP_<num>
 *  <pubkey_1>
 *  <pubkey_2>
 *  <pubkey_n>
 *  OP_<num>
 *  OP_CHECKMULTISIG
 *
 * @example
 * ```typescript
 * const z = Buffer.alloc(32);
 * const p1 = new PrivateKey(1n);
 * const p2 = new PrivateKey(2n);
 * const scriptPubKey = p2msScript(1n, 2n, p1.sec(true), p2.sec(true));
 * ```
 * @param m
 * @param n
 * @param pubkeys
 */
export function p2msLock(m: bigint, n: bigint, ...pubkeys: Buffer[]): Script {
  return new Script([
    0x50 + Number(m),
    ...pubkeys,
    0x50 + Number(n),
    OpCode.OP_CHECKMULTISIG,
  ]); // prettier-ignore
}

/**
 * Creates a p2ms scriptSig and pushes and extra OP_0 for the
 * off-by-one error in p2ms.
 *
 * @remarks
 *  OP_0
 *  <sig_1>
 *  <sig_2>
 *  <sig_m>
 *
 * @examples
 * ```typescript
 * const z = Buffer.alloc(32);
 * const p1 = new PrivateKey(1n);
 * const sig = p1.sign(z);
 * const scriptSig = p2msSig(sig.der());
 * ```
 * @param sigs DER encoded signatures
 */
export function p2msUnlock(...sigs: Buffer[]): Script {
  return new Script([
    OpCode.OP_0,
    ...sigs.map(sig => combineLE(sig, 0x01))
  ]); // prettier-ignore
}

/**
 * Creates the scriptPubKey for p2sh based on the provided hash160
 * of the redeem script.
 *
 * @remarks
 *  OP_HASH160
 *  <hash - 20 bytes>
 *  OP_EQUAL
 *
 * @example
 * ```typescript
 * const redeemScript = new Script([OpCode.OP_DUP, OpCode.OP_ADD, OpCode.OP_4, OpCode.OP_EQUAL]);
 * const h160 = redeemScript.hash160();
 * const scriptPubKey = p2sh(h160);
 * ```
 * @param h160 hash160 of the script
 */
export function p2shLock(h160: Buffer): Script {
  return new Script([
    OpCode.OP_HASH160,
    h160,
    OpCode.OP_EQUAL,
  ]); // prettier-ignore
}

/**
 * Creates a p2sh scriptSig for the redeem script and scriptSig data.
 *
 * @remarks
 *  <redeem script>
 *  <other commands>
 *
 * @example
 * ```typescript
 * const redeemScript = new Script([
 *    OpCode.OP_DUP,
 *    OpCode.OP_ADD,
 *    OpCode.OP_4,
 *    OpCode.OP_EQUAL
 * ]);
 * const scriptSig = p2shSig(redeemScript, OpCode.OP_2);
 * ```
 *
 * @param redeemScript redeems script that has the hash160 matching the scriptPubKey
 * @param cmds zero or more commands needed to unlock the redeemScript
 */
export function p2shUnlock(redeemScript: Script, ...cmds: ScriptCmd[]): Script {
  return new Script([
    ...cmds,
    redeemScript.serializeCmds(),
  ]); // prettier-ignore
}

/**
 * Creats a p2wpkh ScriptPubKey. The h160 should be the h160 for the compressed
 * public key.
 *
 * @remakrs
 * OP_0
 * OP_PUSHBYTES_20 <h160>
 *
 * @param h160
 */
export function p2wpkhLock(h160: Buffer): Script {
  return new Script([
    OpCode.OP_0,
    h160
  ]); // prettier-ignore
}

/**
 * Creates a p2wpkh ScripSig which is empty!
 */
export function p2wpkhUnlock(): Script {
  return new Script();
}

/**
 * P2WPKH witness data is the same as P2PKH ScriptSig information. In this
 * case it includes:
 *    DER encoded signature + 1-byte hash type
 *    SEC encoded compressed public key
 * @param sig
 * @param pubkey
 */
export function p2wpkhWitness(sig: Signature, pubkey: S256Point): ScriptCmd[] {
  return [
    combineLE(sig.der(), 0x01), // add SIGHASH_ALL byte
    pubkey.sec(true),
  ];
}

/**
 * Creates a p2wsh ScriptPubKey. The s256 should be the sha256 of the redeem
 * script.
 * @param s256 sha256 of the redeem script
 */
export function p2wshLock(s256: Buffer): Script {
  return new Script([
    OpCode.OP_0,
    s256
  ]); // prettier-ignore
}

/**
 * Creates a p2wsh ScriptSig, which is empty
 */
export function p2wshUnlock(): Script {
  return new Script();
}

/**
 * Creates p2wsh witness data. The sha256 of the redeemScript will match
 * the value in the p2wsh ScriptPubKey
 * @param redeemScript Redeem script
 * @param cmds commands needed to unlocok redeemScript
 */
export function p2wshWitness(
  redeemScript: Script,
  ...cmds: ScriptCmd[]
): ScriptCmd[] {
  return [
    ...cmds,
    redeemScript.serializeCmds(),
  ]; // prettier-ignore
}
