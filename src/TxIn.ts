import { Readable } from "stream";
import { combine } from "./util/BufferUtil";
import { bigToBufLE, bigFromBufLE } from "./util/BigIntUtil";
import { TxFetcher } from "./TxFetcher";
import { Tx } from "./Tx";
import { Script } from "./script/Script";
import { ScriptCmd } from "./script/ScriptCmd";
import { encodeVarint } from "./util/Varint";

export class TxIn {
  public prevTx: string;
  public prevIndex: bigint;
  public scriptSig: Script;
  public sequence: bigint;
  public witness: ScriptCmd[];

  public prevTxValue: bigint;
  public prevTxScriptPubKey: Script;

  /**
   * Parses a TxIn from a stream
   * @param stream
   */
  public static parse(stream: Readable): TxIn {
    const prevTx = Buffer.from(stream.read(32)).reverse(); // convert to big-endian
    const prevIndex = bigFromBufLE(stream.read(4));
    const scriptSig = Script.parse(stream);
    const sequence = bigFromBufLE(stream.read(4));
    return new TxIn(prevTx.toString("hex"), prevIndex, scriptSig, sequence);
  }

  constructor(
    prevTx: string,
    prevIndex: bigint,
    scriptSig: Script = new Script(),
    sequence: bigint = BigInt(0xffffffff)
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
      Buffer.from(this.prevTx, "hex").reverse(), // convert to little-endian
      bigToBufLE(this.prevIndex, 4),
      this.scriptSig.serialize(),
      bigToBufLE(this.sequence, 4)
    );
  }

  /**
   * Retrieves the previous transaction
   * @param testnet
   */
  public async fetchTx(testnet: boolean = false): Promise<Tx> {
    return TxFetcher.fetch(this.prevTx, testnet);
  }

  /**
   * Gets the output value by looking uup the tx hash and returns
   * the amount in satoshi
   * @param testnet
   */
  public async value(testnet: boolean = false): Promise<bigint> {
    if (this.prevTxValue) return this.prevTxValue;
    const tx = await this.fetchTx(testnet);
    this.prevTxValue = tx.txOuts[Number(this.prevIndex)].amount;
    this.prevTxScriptPubKey = tx.txOuts[Number(this.prevIndex)].scriptPubKey;
    return this.prevTxValue;
  }

  /**
   * Get the ScriptPubKey by looking up the tx hash and returning the
   * script object
   * @param testnet
   */
  public async scriptPubKey(testnet: boolean = false): Promise<Script> {
    if (this.prevTxScriptPubKey) return this.prevTxScriptPubKey;
    const tx = await this.fetchTx(testnet);
    this.prevTxValue = tx.txOuts[Number(this.prevIndex)].amount;
    this.prevTxScriptPubKey = tx.txOuts[Number(this.prevIndex)].scriptPubKey;
    return this.prevTxScriptPubKey;
  }
}
