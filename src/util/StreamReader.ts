import { Readable } from "stream";
import { decodeVarint } from "./Varint";

export class StreamReader {
  constructor(readonly stream: Readable) {}

  public async read(len?: number): Promise<Buffer> {
    const stream = this.stream;

    return new Promise(resolve => {
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
