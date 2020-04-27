import { Readable } from "stream";
import { combine } from "./util/BufferUtil";
import { bigFromBufLE, bigToBufLE } from "./util/BigIntUtil";
import { Script } from "./script/Script";

export class TxOut {
  public amount: bigint;
  public scriptPubKey: Script;

  /**
   * Parses a TxOut from a stream
   * @param stream
   */
  public static parse(stream: Readable): TxOut {
    const amount = bigFromBufLE(stream.read(8));
    const scriptPubKey = Script.parse(stream);
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
