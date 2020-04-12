import { hash256 } from "./util/Hash256";
import { Readable } from "stream";
import { read } from "./util/StreamReader";

export class Tx {
  public version: number;
  public readonly txIns: any[];
  public readonly txOuts: any[];
  public locktime: number;
  public testnet: boolean;

  public static async parse(stream: Readable): Tx {
    const version = (await read(stream, 4).readUInt32LE();
  }

  constructor(
    version: number,
    txIns: any[],
    txOuts: any[],
    locktime: number,
    testnet: boolean
  ) {
    this.version = version;
    this.txIns = txIns || [];
    this.txOuts = txOuts || [];
    this.locktime = locktime;
    this.testnet = testnet;
  }

  public toString() {
    const ins = this.txIns.map((p) => p.toString()).join("\n");
    const outs = this.txOuts.map((p) => p.toString()).join("\n");
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

  public serialize(): Buffer {
    throw new Error("Not implemented");
  }
}
