import { hash256 } from "./util/Hash256";
import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { TxIn } from "./TxIn";
import { TxOut } from "./TxOut";
import { combine } from "./util/BufferUtil";
import { bigToBufLE } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";

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
}
