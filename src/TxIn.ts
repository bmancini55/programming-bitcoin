import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { combine } from "./util/BufferUtil";
import { bigToBufLE, bigToBuf } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";

export class TxIn {
  public prevTx: string;
  public prevIndex: bigint;
  public scriptSig: Buffer;
  public sequence: bigint;

  /**
   * Parses a TxIn from a stream
   * @param stream
   */
  public static async parse(stream: Readable): Promise<TxIn> {
    const sr = new StreamReader(stream);
    const prevTx = await sr.read(32);
    const prevIndex = await sr.readUInt32LE();
    const scriptSigLen = await sr.readVarint();
    const scriptSig = await sr.read(Number(scriptSigLen));
    const sequence = await sr.readUInt32LE();
    return new TxIn(prevTx.toString("hex"), prevIndex, scriptSig, sequence);
  }

  constructor(
    prevTx: string,
    prevIndex: bigint,
    scriptSig: Buffer,
    sequence: bigint
  ) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.scriptSig = scriptSig;
    this.sequence = sequence;
  }

  public toString() {
    return `${this.prevTx}:${this.prevIndex}`;
  }

  /**
   * Returns the byte serialization of the transaction input
   */
  public serialize(): Buffer {
    return combine(
      Buffer.from(this.prevTx, "hex"),
      bigToBufLE(this.prevIndex, 4),
      encodeVarint(BigInt(this.scriptSig.length)),
      this.scriptSig,
      bigToBufLE(this.sequence, 4)
    );
  }
}
