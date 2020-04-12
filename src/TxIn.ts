import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";

export class TxIn {
  public prevTx: string;
  public prevIndex: bigint;
  public scriptSig: Buffer;
  public sequence: bigint;

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
}
