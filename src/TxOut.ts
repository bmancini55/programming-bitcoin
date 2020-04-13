import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { combine } from "./util/BufferUtil";
import { bigToBufLE } from "./util/BigIntUtil";
import { Script } from "./script/Script";

export class TxOut {
  public amount: bigint;
  public scriptPubKey: Script;

  /**
   * Parses a TxOut from a stream
   * @param stream
   */
  public static async parse(stream: Readable): Promise<TxOut> {
    const sr = new StreamReader(stream);
    const amount = await sr.readUInt64LE();
    const scriptPubKey = await Script.parse(stream);
    return new TxOut(amount, scriptPubKey);
  }

  constructor(amount: bigint, scriptPubKey: Script) {
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  public toString() {
    return `${this.amount}:${this.scriptPubKey}`;
  }

  /**
   * Returns the serialization of the transaction output
   */
  public serialize(): Buffer {
    return combine(bigToBufLE(this.amount, 8), this.scriptPubKey.serialize());
  }
}
