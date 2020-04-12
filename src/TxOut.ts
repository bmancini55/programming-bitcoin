import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";

export class TxOut {
  public amount: bigint;
  public scriptPubKey: any;

  public static async parse(stream: Readable): Promise<TxOut> {
    const sr = new StreamReader(stream);
    const amount = await sr.readUInt64LE();
    const scriptPubKeyLen = await sr.readVarint();
    const scriptPubKey = await sr.read(Number(scriptPubKeyLen));
    return new TxOut(amount, scriptPubKey);
  }

  constructor(amount: bigint, scriptPubKey: any) {
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  public toString() {
    return `${this.amount}:${this.scriptPubKey}`;
  }
}
