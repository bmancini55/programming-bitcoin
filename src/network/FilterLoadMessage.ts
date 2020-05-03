import { INetworkMessage } from "./NetworkMessage";
import { BloomFilter } from "../BloomFilter";
import { bigToBufLE, bigToBuf } from "../util/BigIntUtil";
import { combine } from "../util/BufferUtil";
import { encodeVarint } from "../util/Varint";

export class FilterLoadMessage implements INetworkMessage {
  public command: string = "filterload";

  constructor(readonly bloomFilter: BloomFilter) {}

  public serialize(): Buffer {
    const data = bigToBufLE(this.bloomFilter.bits);
    return combine(
      encodeVarint(data.length),
      data,
      bigToBufLE(this.bloomFilter.fnCount, 4),
      bigToBufLE(this.bloomFilter.tweak, 4),
      Buffer.from([0x01]) // flag to update bloom filter with matches
    );
  }
}
