import { hash256 } from "./util/Hash256";
import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { TxIn } from "./TxIn";
import { TxOut } from "./TxOut";
import { combine, bufToStream } from "./util/BufferUtil";
import { bigToBufLE, bigFromBufLE } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";
import { Script } from "./script/Script";

export class Tx {
  public version: bigint;
  public readonly txIns: TxIn[];
  public readonly txOuts: TxOut[];
  public locktime: bigint;
  public testnet: boolean;

  public static async parse(stream: Readable): Promise<Tx> {
    const sr = new StreamReader(stream);

    // get the version
    const version = await sr.readUInt32LE();

    // obtain the inputs
    const inLen = await sr.readVarint();
    const ins = [];
    for (let i = 0n; i < inLen; i++) {
      ins.push(await TxIn.parse(stream));
    }

    // obtain the outputs
    const outLen = await sr.readVarint();
    const outs = [];
    for (let i = 0n; i < outLen; i++) {
      outs.push(await TxOut.parse(stream));
    }

    // locktime
    const locktime = await sr.readUInt32LE();

    return new Tx(version, ins, outs, locktime, true);
  }

  constructor(
    version: bigint,
    txIns: any[],
    txOuts: any[],
    locktime: bigint,
    testnet: boolean
  ) {
    this.version = version;
    this.txIns = txIns || [];
    this.txOuts = txOuts || [];
    this.locktime = locktime;
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
      `testnet: ${this.testnet}`,
    ].join("\n");
  }

  /**
   * Returns the 32-byte hash as hexidecimal
   */
  public id(): string {
    return this.hash().toString("hex");
  }

  /**
   * Returns the hash256 of the transaction serialization in little-endian.
   */
  public hash(): Buffer {
    return hash256(this.serialize().reverse());
  }

  /**
   * Returns the byte serialization the transaction
   */
  public serialize(): Buffer {
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
   * Performs a deep-copy clone of the current transaction
   */
  public async clone(): Promise<Tx> {
    return await Tx.parse(bufToStream(this.serialize()));
  }

  /**
   * Generates the signing hash for a specific input by doing the following:
   * 1. removing all scriptSig information and replacing it with a blank script object
   * 2. for the target input, replace scriptSig with the scriptPubKey obtained f
   *    from the original transaction
   * 3. serialize the transaction and append the 0x01000000 for the SIGHASH_ALL
   * 4. return hash256
   * @param input
   */
  public async sigHash(
    input: number,
    testnet: boolean = false
  ): Promise<Buffer> {
    // serialize version
    const version = bigToBufLE(this.version, 4);

    // serialize inputs and blank out scriptSig or
    // replace scriptSig for target input with scriptPubKey
    const txInLen = encodeVarint(BigInt(this.txIns.length));
    const txIns = [];
    for (let i = 0; i < this.txIns.length; i++) {
      const txIn = this.txIns[i];
      const newTxIn = new TxIn(
        txIn.prevTx,
        txIn.prevIndex,
        i === input ? await txIn.scriptPubKey(testnet) : new Script(),
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
}
