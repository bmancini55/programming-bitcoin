import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { combine } from "./util/BufferUtil";
import { bigToBufLE, bigToBuf } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";
import { TxFetcher } from "./TxFetcher";
import { Tx } from "./Tx";
import { Script } from "./Script";

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
    const prevTx = (await sr.read(32)).reverse(); // little-endian
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
      Buffer.from(this.prevTx, "hex").reverse(), // little-endian
      bigToBufLE(this.prevIndex, 4),
      encodeVarint(BigInt(this.scriptSig.length)),
      this.scriptSig,
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
    const tx = await this.fetchTx(testnet);
    return tx.txOuts[Number(this.prevIndex)].amount;
  }

  /**
   * Get the ScriptPubKey by looking up the tx hash and returning the
   * script object
   * @param testnet
   */
  public async scriptPubKey(testnet: boolean = false): Promise<Script> {
    const tx = await this.fetchTx(testnet);
    return tx.txOuts[Number(this.prevIndex)].scriptPubKey;
  }
}
