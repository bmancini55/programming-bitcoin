import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { combine } from "./util/BufferUtil";
import { bigToBufLE } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";

export class Script {
  public data: Buffer;

  /**
   * Parses a script from a stream
   * @param stream
   */
  public static async parse(stream: Readable): Promise<Script> {
    const sr = new StreamReader(stream);
    const len = await sr.readVarint();
    const data = await sr.read(Number(len));
    return new Script(data);
  }
  constructor(data: Buffer) {
    this.data = data;
  }

  /**
   * Serializes the script into a buffer
   */
  public serialize(): Buffer {
    return combine(
      encodeVarint(BigInt(this.data.length)),
      this.data
    ); // prettier-ignore
  }
}
