import { INetworkMessage } from "./NetworkMessage";
import { combine } from "../util/BufferUtil";
import { bigToBufLE } from "../util/BigIntUtil";
import { encodeVarint } from "../util/Varint";

/**
 * Retreives headers for the various supplied block ranges
 */
export class GetHeadersMessage implements INetworkMessage {
  public command: string = "getheaders";
  public version: bigint = 70015n;
  public blockLocatorHashes: Buffer[];
  public hashStop: Buffer = Buffer.alloc(32);

  constructor(startHash: Buffer) {
    this.blockLocatorHashes = [startHash];
  }

  public serialize(): Buffer {
    return combine(
      bigToBufLE(this.version, 4),
      encodeVarint(this.blockLocatorHashes.length),
      ...this.blockLocatorHashes.map(p => p.reverse()),
      this.hashStop.reverse()
    );
  }
}
