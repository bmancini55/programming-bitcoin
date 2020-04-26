import { Readable } from "stream";
import { decodeVarint } from "./Varint";

export class StreamReader {
  constructor(readonly stream: Readable) {}

  /**
   * Performs a blocked async read operation. This method will either immedidately resolve the
   * requested data or will wait for the `readable` event to be emitted and will attempt to
   * read the requestted length of data again.
   *
   * This is necessary because `read(len)` on streams will emit null when the data is not
   * yet available on the Buffer.
   *
   * @example
   * ```typescript
   * const sr = new StreamReader(stream);
   * const val1 = await sr.read(4);
   * const val2 = await sr.read(2);
   * const val3 = await sr.read(32);
   * ```
   *
   * @param len
   */
  public async read(len?: number): Promise<Buffer> {
    const stream = this.stream;

    return new Promise(resolve => {
      // shortcut read if we don't want to read any bytes
      if (len === 0) {
        resolve(Buffer.alloc(0));
        return;
      }

      let val: Buffer = stream.read(len);

      // when reading all and we have a value
      if (val && !len) {
        resolve(val);
      }

      // when reading a length and the length is returned
      else if (val && val.length === len) {
        resolve(val);
      }

      // otherwise, were unable to read the length and need to
      // wait for some readable data
      else {
        const waitRead = () => {
          stream.once("readable", () => {
            val = stream.read(len);

            if (val && !len) {
              resolve(val);
            }

            // when reading a length and the length is returned
            else if (val && val.length === len) {
              resolve(val);
            }

            // otherwise, were unable to read the length and need to
            // wait for some readable data
            else {
              waitRead();
            }
          });
        };
        waitRead();
      }
    });
  }

  public async readUInt8(): Promise<number> {
    const buf = await this.read(1);
    return buf[0];
  }

  public async readUInt16LE(): Promise<bigint> {
    const buf = await this.read(2);
    return BigInt(buf.readUInt16LE());
  }

  public async readUInt32LE(): Promise<bigint> {
    const buf = await this.read(4);
    return BigInt(buf.readUInt32LE());
  }

  public async readUInt64LE(): Promise<bigint> {
    const buf = await this.read(8);
    return buf.readBigUInt64LE();
  }

  public async readVarint(): Promise<bigint> {
    return decodeVarint(this.stream);
  }
}
