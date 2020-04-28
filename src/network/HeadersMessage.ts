import { INetworkMessage } from "./NetworkMessage";
import { Readable } from "stream";
import { decodeVarint } from "../util/Varint";
import { Block } from "../Block";

/**
 * Returns the headers
 */
export class HeadersMessage implements INetworkMessage {
  /**
   * Parses a stream into headers message
   * @param stream
   */
  public static parse(stream: Readable): HeadersMessage {
    const numHeaders = decodeVarint(stream);
    const blocks = [];
    for (let i = 0n; i < numHeaders; i += 1n) {
      const block = Block.parse(stream);
      const numTxs = decodeVarint(stream);
      if (numTxs !== 0n) {
        throw new Error("number of txs not 0");
      }
      blocks.push(block);
    }
    return new HeadersMessage(blocks);
  }

  public command: string = "headers";
  public blocks: Block[];

  constructor(blocks?: Block[]) {
    this.blocks = blocks || [];
  }

  public serialize(): Buffer {
    throw new Error("Not implemented");
  }
}
