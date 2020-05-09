import { hash256 } from "./util/Hash256";
import { Readable } from "stream";
import { TxIn } from "./TxIn";
import { TxOut } from "./TxOut";
import { combine, bufToStream } from "./util/BufferUtil";
import {
  bigToBufLE,
  bigFromBuf,
  bigToBuf,
  bigFromBufLE,
} from "./util/BigIntUtil";
import { encodeVarint, decodeVarint } from "./util/Varint";
import { Script } from "./script/Script";
import { PrivateKey } from "./ecc/PrivateKey";
import { ScriptCmd } from "./script/ScriptCmd";
import { OpCode } from "./script/OpCode";
import { bitArrayToBuf } from "./util/BitArrayUtil";
import { p2pkhScript } from "./script/ScriptFactories";

export class Tx {
  public version: bigint;
  public readonly txIns: TxIn[];
  public readonly txOuts: TxOut[];
  public locktime: bigint;
  public testnet: boolean;
  public segwit: boolean;

  private _hashPrevouts: Buffer;
  private _hashSequence: Buffer;
  private _hashOutputs: Buffer;

  /**
   * Parses either a legacy or segwit transaction by detecting the segwit marker
   * @param stream
   * @param testnet
   */
  public static parse(stream: Readable, testnet: boolean = false): Tx {
    // read the first 5 bytes, 4-version, 1-flag???
    const bytes = stream.read(5);

    // unshift the flag and version before parsing
    stream.unshift(bytes);

    if (bytes[4] === 0x00) {
      return this.parseSegwit(stream, testnet);
    } else {
      return this.parseLegacy(stream, testnet);
    }
  }

  /**
   * Parses a legacy transaction which includes:
   *
   * version - 4 bytes LE,
   * num vin - varint
   * vins
   * num vout - varint
   * vouts
   * locktime - 4 byte LE
   * @param stream
   * @param testnet
   */
  private static parseLegacy(stream: Readable, testnet: boolean = false): Tx {
    // get the version
    const version = bigFromBufLE(stream.read(4));

    // obtain the inputs
    const inLen = decodeVarint(stream);
    const ins = [];
    for (let i = 0n; i < inLen; i++) {
      ins.push(TxIn.parse(stream));
    }

    // obtain the outputs
    const outLen = decodeVarint(stream);
    const outs = [];
    for (let i = 0n; i < outLen; i++) {
      outs.push(TxOut.parse(stream));
    }

    // locktime
    const locktime = bigFromBufLE(stream.read(4));

    return new Tx(version, ins, outs, locktime, false, testnet);
  }

  /**
   * Parses a segwit transaction. Segwit transactions differ from legacy
   * transactions by having a two-byte marker and segwit version 0x0001 as the
   * 5th and 6th bytes. They also include witness data after vout and before
   * the locktime.
   * @param stream
   * @param testnet
   */
  public static parseSegwit(stream: Readable, testnet: boolean = false): Tx {
    // get the version
    const version = bigFromBufLE(stream.read(4));

    // read and test marker
    const marker = stream.read(2);
    if (marker[0] !== 0x00 || marker[1] !== 0x01) {
      throw new Error("Not a segwit transaction " + marker.toString("hex"));
    }

    // vin
    const vinLen = decodeVarint(stream);
    const vins: TxIn[] = [];
    for (let i = 0n; i < vinLen; i++) {
      vins.push(TxIn.parse(stream));
    }

    // vout
    const voutLen = decodeVarint(stream);
    const vouts: TxOut[] = [];
    for (let i = 0n; i < voutLen; i++) {
      vouts.push(TxOut.parse(stream));
    }

    // witness data
    for (const vin of vins) {
      // get the count of items
      const numItems = decodeVarint(stream);

      // read the items
      const items: ScriptCmd[] = [];
      for (let i = 0n; i < numItems; i++) {
        // get the item length
        const itemLen = decodeVarint(stream);
        if (itemLen === 0n) {
          items.push(OpCode.OP_0);
        } else {
          items.push(stream.read(Number(itemLen)));
        }
      }

      // add witness items to input
      vin.witness = items;
    }

    // locktime
    const locktime = bigFromBufLE(stream.read(4));

    return new Tx(version, vins, vouts, locktime, true, testnet);
  }

  constructor(
    version: bigint = 1n,
    txIns: TxIn[] = [],
    txOuts: TxOut[] = [],
    locktime: bigint = 0n,
    segwit: boolean = false,
    testnet: boolean = false
  ) {
    this.version = version;
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.locktime = locktime;
    this.segwit = segwit;
    this.testnet = testnet;
  }

  public toString() {
    const ins = this.txIns.map(p => p.toString()).join("\n");
    const outs = this.txOuts.map(p => p.toString()).join("\n");
    return [
      `version: ${this.version}`,
      `ins: ${ins}`,
      `outs: ${outs}`,
      `locktime: ${this.locktime}`,
      `segwit: ${this.segwit}`,
      `testnet: ${this.testnet}`,
    ].join("\n");
  }

  /**
   * Returns the 32-byte hash in RPC hash byte order as a hexidecimal
   */
  public id(): string {
    return this.hash().toString("hex");
  }

  /**
   * Returns the hash256 of the transaction serialization in reversed byte order
   * using the legacy serialization (to maintain backwards compaitbility)
   */
  public hash(): Buffer {
    return hash256(this.serializeLegacy()).reverse();
  }

  /**
   * Returns the byte serialization of the transaction for either legacy or
   * segwit transactions.
   */
  public serialize(): Buffer {
    if (this.segwit) {
      return this.serializeSegwit();
    } else {
      return this.serializeLegacy();
    }
  }

  /**
   * Performs the legacy serialization of the transaction
   */
  public serializeLegacy(): Buffer {
    return combine(
      bigToBufLE(this.version, 4),
      encodeVarint(BigInt(this.txIns.length)),
      ...this.txIns.map(p => p.serialize()),
      encodeVarint(BigInt(this.txOuts.length)),
      ...this.txOuts.map(p => p.serialize()),
      bigToBufLE(this.locktime, 4)
    );
  }

  /**
   * Performs the segwit serialization of the transaction
   */
  public serializeSegwit(): Buffer {
    return combine(
      bigToBufLE(this.version, 4),
      Buffer.from([0x00, 0x01]), // segwit marker and version
      encodeVarint(BigInt(this.txIns.length)),
      ...this.txIns.map(p => p.serialize()),
      encodeVarint(BigInt(this.txOuts.length)),
      ...this.txOuts.map(p => p.serialize()),
      this.serializeWitness(), // witness information
      bigToBufLE(this.locktime, 4)
    );
  }

  /**
   * Serializes the witness data for each input in the format:
   *
   * for each input:
   * num_items: varint
   *
   * for each item:
   * item_len: varint
   * item: item_len
   */
  public serializeWitness(): Buffer {
    const bufs = [];
    // for each input
    for (const vin of this.txIns) {
      // number of items in input
      bufs.push(encodeVarint(vin.witness.length));
      // foreach item, encode item_len and item_data
      for (const item of vin.witness) {
        if (Buffer.isBuffer(item)) {
          bufs.push(encodeVarint(item.length));
          bufs.push(item);
        } else {
          bufs.push(encodeVarint(1));
          bufs.push(encodeVarint(item as number));
        }
      }
    }
    return combine(...bufs);
  }

  /**
   * Calculates the fees in satoshi
   */
  public async fees(testnet: boolean = false): Promise<bigint> {
    let inAmt = 0n;
    for (const txIn of this.txIns) {
      inAmt += await txIn.value(testnet);
    }

    let outAmt = 0n;
    for (const txOut of this.txOuts) {
      outAmt += txOut.amount;
    }

    return inAmt - outAmt;
  }

  /**
   * Generates the signing hash for a specific input by doing the following:
   * 1. removing all scriptSig information and replacing it with a blank script object
   * 2. for the target input, replace scriptSig with the scriptPubKey obtained
   *    from the original transaction or the redeemScript if it is provided
   * 3. serialize the transaction and append the 0x01000000 for the SIGHASH_ALL
   * 4. return hash256
   * @param input
   */
  public async sigHashLegacy(
    input: number,
    redeemScript?: Script
  ): Promise<Buffer> {
    // serialize version
    const version = bigToBufLE(this.version, 4);

    // serialize inputs and blank out scriptSig or
    // replace scriptSig for target input with scriptPubKey
    const txInLen = encodeVarint(BigInt(this.txIns.length));
    const txIns = [];
    for (let i = 0; i < this.txIns.length; i++) {
      const txIn = this.txIns[i];

      // determine which script to use
      let script: Script;
      if (i !== input) {
        script = new Script(); // blank when not the input
      } else {
        if (redeemScript) {
          script = redeemScript; // redeem script when provided
        } else {
          script = await txIn.scriptPubKey(this.testnet); // previous script_pub_key otherwise
        }
      }

      const newTxIn = new TxIn(
        txIn.prevTx,
        txIn.prevIndex,
        script,
        txIn.sequence
      );
      txIns.push(newTxIn.serialize());
    }

    const txOutLen = encodeVarint(BigInt(this.txOuts.length));
    const txOuts = this.txOuts.map(txOut => txOut.serialize());
    const locktime = bigToBufLE(this.locktime, 4);
    const sigHashType = bigToBufLE(1n, 4);

    return hash256(
      combine(
        version,
        txInLen,
        ...txIns,
        txOutLen,
        ...txOuts,
        locktime,
        sigHashType
      )
    );
  }

  /**
   * Generates the signing hash for a segwit transaction according to rules
   * specified in BIP0143.
   * @param input
   */
  public async sigHashSegwit(
    input: number,
    redeemScript?: Script,
    witnessScript?: Script,
    amount?: bigint
  ): Promise<Buffer> {
    const vin = this.txIns[input];
    const version = bigToBufLE(this.version, 4);
    const hashPrevouts = this.hashPrevouts();
    const hashSequence = this.hashSequence();

    const prevOut = Buffer.from(vin.prevTx, "hex").reverse();
    const prevIndex = bigToBufLE(vin.prevIndex, 4);

    let scriptCode: Buffer;

    // p2wpkh
    if (witnessScript) {
      scriptCode = witnessScript.serialize();
    } else if (redeemScript) {
      scriptCode = p2pkhScript(redeemScript.cmds[1] as Buffer).serialize();
    } else {
      const prevScriptPubKey = await vin.scriptPubKey(this.testnet);
      scriptCode = p2pkhScript(prevScriptPubKey.cmds[1] as Buffer).serialize();
    }

    const value = bigToBufLE(amount || (await vin.value()), 8);
    const sequence = bigToBufLE(vin.sequence, 4);
    const hashOutputs = this.hashOutputs();
    const locktime = bigToBufLE(this.locktime, 4);
    const sigHashType = bigToBufLE(1n, 4);

    const preimage = combine(
      version,
      hashPrevouts,
      hashSequence,
      prevOut,
      prevIndex,
      scriptCode,
      value,
      sequence,
      hashOutputs,
      locktime,
      sigHashType
    );
    return hash256(preimage);
  }

  /**
   * Combines the previous outputs for all inputs in the transaction by
   * serializing them as:
   *    prevTx: 32-bytes IBO
   *    prevIdx: 4-byte LE
   * The combined byte array is hash256.
   *
   * This operation is only performed once and the value is cached to elliminate
   * the quadratic hashing problem.
   */
  public hashPrevouts() {
    if (this._hashPrevouts) return this._hashPrevouts;
    const buffers = [];
    for (const vin of this.txIns) {
      buffers.push(Buffer.from(vin.prevTx, "hex").reverse());
      buffers.push(bigToBufLE(vin.prevIndex, 4));
    }
    this._hashPrevouts = hash256(combine(...buffers));
    return this._hashPrevouts;
  }

  /**
   * Combines the sequences for each input in the transaction and hashes the
   * combined byte array using hash256. This is defined in BIP143.
   *
   * This operation is only performed once and the value is cached to elliminate
   * the quadratic hashing problem.
   */
  public hashSequence() {
    if (this._hashSequence) return this._hashSequence;
    const buffers = [];
    for (const vin of this.txIns) {
      buffers.push(bigToBufLE(vin.sequence, 4));
    }
    this._hashSequence = hash256(combine(...buffers));
    return this._hashSequence;
  }

  /**
   * Hashes the ouputs for the transaction according to BIP143 by concatenating
   * the serialization of all of the outputs into a single byte array and then
   * performing a hash256 on the complete byte stream.
   *
   * This operation is only performed once and the value is cached to elliminate
   * the quadratic hashing problem.
   */
  public hashOutputs() {
    if (this._hashOutputs) return this._hashOutputs;
    const buffers = [];
    for (const vout of this.txOuts) {
      buffers.push(vout.serialize());
    }
    this._hashOutputs = hash256(combine(...buffers));
    return this._hashOutputs;
  }

  /**
   * Verifies a single input by checking that the script correctly evaluates.
   * This method creates a sig_hash for the input, combines the scriptSig +
   * scriptPubKey for the input and evaluates the combined script.
   *
   * For P2SH inputs, it will check if the scriptPubKey is P2SH and will pluck
   * the redeemScript from the end of the scriptSig commands, parse the redeemScript
   * and provide it to the hash function.
   *
   * For segwit
   * @param i
   * @param testnet
   */
  public async verifyInput(i: number): Promise<boolean> {
    const vin = this.txIns[i];
    const pubKey = await vin.scriptPubKey(this.testnet);
    let z: Buffer;
    let witness: ScriptCmd[];

    // p2sh / p2nwpk / p2nwsh
    if (pubKey.isP2shScriptPubKey()) {
      // extract the redeem script from the last command in ScriptSig
      const redeemBytes = vin.scriptSig.cmds[
        vin.scriptSig.cmds.length - 1
      ] as Buffer;

      // construct a valid Script by combining the length and script bytes
      // and using Script.parse
      const redeemScript = Script.parse(
        bufToStream(
          combine(
            encodeVarint(redeemBytes.length), // length of bytes
            redeemBytes // redeem script bytes
          )
        )
      );

      // p2nwpkh
      if (redeemScript.isP2wpkhScriptPubKey()) {
        z = await this.sigHashSegwit(i, redeemScript);
        witness = vin.witness;
      }

      // p2sh
      else {
        z = await this.sigHashLegacy(i, redeemScript);
        witness = undefined;
      }
    }

    // p2wpkh
    else if (pubKey.isP2wpkhScriptPubKey()) {
      z = await this.sigHashSegwit(i);
      witness = vin.witness;
    }

    // p2pkh, p2pk, others...
    else {
      z = await this.sigHashLegacy(i);
      witness = undefined;
    }

    // combine scriptsig + scriptpubkey
    const combined = vin.scriptSig.add(pubKey);

    // evaluate combined script
    return combined.evaluate(z);
  }

  /**
   * Verifies the complete transaction by performing steps:
   * 1. Verifies that new bitcoins are not created
   * 2. Verifies each input evaluates
   *
   * Because this is a light node, we cannot verify that it
   * is a UTXO
   */
  public async verify(): Promise<boolean> {
    // vefify no new bitcoins are created
    if ((await this.fees(this.testnet)) < 0) {
      return false;
    }

    // verify each input evaluates
    for (let i = 0; i < this.txIns.length; i++) {
      if (!(await this.verifyInput(i))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Signs the input and assigns the signature to the script sig
   * @param i
   * @param pk
   */
  public async signInput(i: number, pk: PrivateKey): Promise<boolean> {
    const txin = this.txIns[i];
    const z = await this.sigHashLegacy(i);
    const sig = pk.sign(bigFromBuf(z));
    const der = combine(sig.der(), bigToBuf(1n));
    const sec = pk.point.sec(true);
    txin.scriptSig = new Script([der, sec]);
    return this.verifyInput(i);
  }

  /**
   * Returns true when the transaction follows these three rules:
   * 1. Only a single input
   * 2. PrevTxId = 32-bytes of 00
   * 3. PrevIdx = 0xffffffff
   */
  public isCoinbase(): boolean {
    return (
      this.txIns.length === 1 &&
      this.txIns[0].prevTx ===
        "0000000000000000000000000000000000000000000000000000000000000000" &&
      this.txIns[0].prevIndex === BigInt(0xffffffff)
    );
  }

  /**
   * Coinbase transactions are required to put the block height in the first
   * command of the scriptSig for the coinbase input. This was implemented in
   * BIP0034 to ensure that coinbase transactions do not have the same hash
   */
  public coinbaseHeight(): bigint {
    if (!this.isCoinbase()) return;
    return bigFromBufLE(this.txIns[0].scriptSig.cmds[0] as Buffer);
  }
}
