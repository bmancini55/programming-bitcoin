import { Readable } from "stream";
import { StreamReader } from "../util/StreamReader";
import { combine } from "../util/BufferUtil";
import { encodeVarint } from "../util/Varint";
import { OpCode } from "./OpCode";
import { bigToBufLE } from "../util/BigIntUtil";
import { ScriptPart } from "./ScriptPart";

/**
 *
 */
export class Script {
  public parts: ScriptPart[];

  /**
   * Parses a script from a stream by reading each element from the stream values
   * @param stream
   */
  public static async parse(stream: Readable): Promise<Script> {
    const sr = new StreamReader(stream);

    // read the length
    const len = await sr.readVarint();

    // store commands
    const stack: ScriptPart[] = [];

    // loop until all bytes have been read
    let pos = 0;
    while (pos < len) {
      // read the current operation/element
      const op = (await sr.read(1)).readUInt8();
      pos += 1;

      // data range between 1-75 bytes
      // simple read op len of bytes
      if (op >= 1 && op <= 75) {
        const n = op;
        stack.push(await sr.read(n));
        pos += n;
      }

      // data range between 76 and 255 bytes uses OP_PUSHDATA1
      // the first byte is the length
      // then the read n bytes
      else if (op === OpCode.OP_PUSHDATA1) {
        const n = (await sr.read(1)).readUInt8();
        pos += 1;

        stack.push(await sr.read(n));
        pos += n;
      }

      // data range between 256 and 520 uses OP_PUSHDATA2
      // reads two bytes little-endian to determine n
      // reads n bytes of data
      else if (op === OpCode.OP_PUSHDATA2) {
        const n = (await sr.read(2)).readUInt16LE();
        pos += 2;

        stack.push(await sr.read(n));
        pos += n;
      }

      // otherwise this is an op code that should be added to
      // the stack
      else {
        stack.push(op);
      }
    }

    // ensure that the correct length was read
    if (pos !== Number(len)) {
      throw new Error("Parsing script failed");
    }

    return new Script(stack);
  }

  constructor(stack?: ScriptPart[]) {
    this.parts = stack || [];
  }

  /**
   * Serializes the Script into a Buffer
   */
  public serialize(): Buffer {
    const scriptData = this.rawSerialize();
    const scriptDataLen = encodeVarint(BigInt(scriptData.length));
    return combine(scriptDataLen, scriptData);
  }

  /**
   * Serializes the Operations and Elements in the script stack
   */
  private rawSerialize(): Buffer {
    const results: Buffer[] = [];
    for (const op of this.parts) {
      // operations are just an integer
      // operations can just be pushed directly onto the byte array
      // after being converted into a single byte byffer
      if (typeof op === "number") {
        const opBuf = Buffer.from([op]);
        results.push(opBuf);
      }

      // elements will be represented as a buffer of information
      // and we will use the length to determine how to encode it
      else if (op instanceof Buffer) {
        // between 1 and 75 bytes are just directly pushed as
        // there is no op_code for these. We first need to push
        // the length of the buffer arrray though as the operation
        if (op.length >= 1 && op.length <= 75) {
          results.push(Buffer.from([op.length]));
          results.push(op);
        }

        // between 76 and 255 uses OP_PUSHDATA1
        // this requires us to push the op_code, a single byte length
        // and finally push the 76-255 bytes of data
        else if (op.length >= 76 && op.length <= 255) {
          results.push(Buffer.from([OpCode.OP_PUSHDATA1])); // op_pushdata1
          results.push(Buffer.from([op.length])); // single-byte
          results.push(op);
        }

        // between 256 and 520 uses OP_PUSHDATA2
        // this requires us to push the op_code, a two-byte little-endian number
        // and finally push the 256-520 bytes of data
        else if (op.length >= 256 && op.length <= 520) {
          results.push(Buffer.from([OpCode.OP_PUSHDATA2])); // op_pushdata2
          results.push(bigToBufLE(BigInt(op.length), 2)); // two-bytes little-endian
          results.push(op);
        }

        // data longer than 520 is not supported
        else {
          throw new Error("Data too long");
        }
      }

      // This should never happen
      else {
        throw new Error("Unknown data");
      }
    }

    // combine all parts of data
    return Buffer.concat(results);
  }
}
