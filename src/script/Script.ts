import { Readable } from "stream";
import { StreamReader } from "../util/StreamReader";
import { combine, combineLE, bufToStream } from "../util/BufferUtil";
import { encodeVarint } from "../util/Varint";
import { OpCode } from "./OpCode";
import { bigToBufLE } from "../util/BigIntUtil";
import { ScriptCmd } from "./ScriptCmd";
import { Operations } from "./Operations";
import { opHash160 } from "./operations/crypto/OpHash160";
import { opEqual } from "./operations/bitwise/OpEqual";
import { opVerify } from "./operations/flowcontrol/OpVerify";
import { hash160 } from "../util/Hash160";
import { isNumber } from "util";

/**
 *
 */
export class Script {
  public cmds: ScriptCmd[];

  /**
   * Parses a script from a stream by reading each element from the stream values
   * @param stream
   */
  public static async parse(stream: Readable): Promise<Script> {
    const sr = new StreamReader(stream);

    // read the length
    const len = await sr.readVarint();

    // store commands
    const stack: ScriptCmd[] = [];

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

  constructor(stack?: ScriptCmd[]) {
    this.cmds = stack || [];
  }

  /**
   * Evaluates the script
   * @param z hash of transaction information
   */
  public async evaluate(z: Buffer): Promise<boolean> {
    const cmds = this.cmds.slice();
    const stack = [];
    const altstack = [];

    // process all commands in the script
    while (cmds.length > 0) {
      const cmd = cmds.shift(); // first element

      // operations pop one or more items from the stack
      // and push zero or more items onto the stack
      if (typeof cmd === "number") {
        // obtain the evaluation function
        const operation = Operations[cmd];

        // add check on the operation since not everything is supported
        if (!operation) {
          // LOG FAILURE
          return false;
        }

        // requires manipulation of the cmds stack
        if (cmd === OpCode.OP_IF || cmd === OpCode.OP_NOTIF) {
          if (!operation(stack, cmds)) {
            // LOG FAILURE
            return false;
          }
        }

        // requires manipulation of the alt stack
        else if (
          cmd === OpCode.OP_TOALTSTACK ||
          cmd === OpCode.OP_FROMALTSTACK
        ) {
          if (!operation(stack, altstack)) {
            // LOG FAILURE
            return false;
          }
        }

        // performs signatures checks and passes in z
        else if (
          cmd === OpCode.OP_CHECKSIG ||
          cmd === OpCode.OP_CHECKSIGVERIFY ||
          cmd === OpCode.OP_CHECKMULTISIG ||
          cmd === OpCode.OP_CHECKMULTISIGVERIFY
        ) {
          if (!operation(stack, z)) {
            // LOG FAILURE
            return false;
          }
        }

        // otherwise it's a normal op and we can do its thing
        else {
          if (!operation(stack)) {
            // LOG FAILURE
            return false;
          }
        }
      }

      // elements get pushed onto the stack
      else {
        stack.push(cmd);

        // Check for p2sh pattern by looking at the reamining commands.
        // The pattern should be: OP_HASH160, 20-bytes of data, OP_EQUAL
        // When p2sh, execute the p2sh script and if successful pushes the
        // dedeem script onto the cmds.
        if (
          cmds.length === 3 &&
          cmds[0] === OpCode.OP_HASH160 &&
          (cmds[1] as Buffer).length === 20 &&
          cmds[2] === OpCode.OP_EQUAL
        ) {
          // execute OP_HASH160
          cmds.shift();
          if (!opHash160(stack)) {
            return false;
          }

          // execute pushdata
          const h160 = cmds.shift();
          stack.push(h160);

          // execute OP_EQUAL
          cmds.shift();
          if (!opEqual(stack)) {
            return false;
          }

          // execute OP_VERIFY to remove remaining value
          if (!opVerify(stack)) {
            // LOG failures
            return false;
          }

          // the next section converts the redeemScript into commands by:
          // 1. prepending the varint script length
          // 2. parseing the buffer information
          // 3. pushing the commands onto the stack
          const redeemScriptBuf = combine(encodeVarint(BigInt(cmd.length)), cmd); // prettier-ignore
          const redeemScriptStream = bufToStream(redeemScriptBuf);
          const redeemScript = await Script.parse(redeemScriptStream);
          cmds.push(...redeemScript.cmds);
        }
      }
    }

    // fails if there is nothing left on the stack
    if (stack.length === 0) {
      return false;
    }

    // the stack will store a false value as an empty byte array
    if (Buffer.alloc(0).equals(stack.pop())) {
      return false;
    }

    // any other result indicates a success!
    return true;
  }

  /**
   * Combines two script bodies together. This is a hacky replacement for
   * how script operations are usually executed.
   * @param script
   */
  public add(script: Script): Script {
    const cmds = [];
    cmds.push(...this.cmds);
    cmds.push(...script.cmds);
    return new Script(cmds);
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
    for (const op of this.cmds) {
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

  /**
   * Returns the hash160 for the script. This is useful for the p2sh methods
   */
  public hash160(): Buffer {
    return hash160(this.serialize());
  }
}
