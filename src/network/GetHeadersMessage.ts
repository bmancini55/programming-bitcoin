import { INetworkMessage } from "./NetworkMessage";
import { combine } from "../util/BufferUtil";
import { bigToBufLE } from "../util/BigIntUtil";
import { encodeVarint } from "../util/Varint";

export class GetHeadersMessage implements INetworkMessage {
  public command: string = "getheaders";
  public version: bigint = 70015n;
  public numHashes: bigint = 1n;
  public startBlock: Buffer;
  public endBlock: Buffer = Buffer.alloc(32);

  constructor(startBlock: Buffer) {
    this.startBlock = startBlock;
  }

  public serialize(): Buffer {
    return combine(
      bigToBufLE(this.version, 4),
      encodeVarint(this.numHashes),
      this.startBlock,
      this.endBlock
    );
  }
}
