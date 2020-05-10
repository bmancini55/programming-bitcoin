import { Readable } from "stream";
import { combine, combineLE, bufToStream } from "../util/BufferUtil";
import { encodeVarint, decodeVarint } from "../util/Varint";
import { OpCode } from "./OpCode";
import { bigToBufLE } from "../util/BigIntUtil";
import { ScriptCmd } from "./ScriptCmd";
import { Operations } from "./Operations";
import { opHash160 } from "./operations/crypto/OpHash160";
import { opEqual } from "./operations/bitwise/OpEqual";
import { opVerify } from "./operations/flowcontrol/OpVerify";
import { hash160 } from "../util/Hash160";
import { p2shAddress, p2pkhAddress } from "../util/Address";
import { p2pkhScript } from "./ScriptFactories";
import { sha256 } from "../util/Sha256";

/**
 *
 */
export class Script {
  public cmds: ScriptCmd[];

  /**
   * Parses a buffer by reading
   * @param stream
   */
  public static parse(stream: Readable): Script {
    // read the length
    const len = decodeVarint(stream);

    // store commands
    const stack: ScriptCmd[] = [];

    // loop until all bytes have been read
    let pos = 0;
    while (pos < len) {
      // read the current operation/element
      const op = stream.read(1)[0];
      pos += 1;

      // data range between 1-75 bytes
      // simple read op len of bytes
      if (op >= 0x01 && op <= 0x4b) {
        const n = op;
        stack.push(stream.read(n));
        pos += n;
      }

      // data range between 76 and 255 bytes uses OP_PUSHDATA1
      // the first byte is the length
      // then the read n bytes
      else if (op === OpCode.OP_PUSHDATA1) {
        const n = stream.read(1)[0];
        pos += 1;

        stack.push(stream.read(n));
        pos += n;
      }

      // data range between 256 and 520 uses OP_PUSHDATA2
      // reads two bytes little-endian to determine n
      // reads n bytes of data
      else if (op === OpCode.OP_PUSHDATA2) {
        const n = Number(stream.read(2).readUInt16LE());
        pos += 2;

        stack.push(stream.read(n));
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
   * @param witness witness data provided for Segwit transactions
   */
  public evaluate(z: Buffer, witness?: ScriptCmd[]): boolean {
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
          const redeemScriptBuf = combine(encodeVarint(cmd.length), cmd);
          const redeemScript = Script.parse(bufToStream(redeemScriptBuf));
          cmds.push(...redeemScript.cmds);
        }

        // Check for the P2WPKH pattern. This pattern pushes two items onto
        // the stack OP_0 and OP_PUSHBYTES_20 which is the h160 for the p2pkh
        // transaction. If this pattern is found, then we want to mutate the
        // commands with a P2PKH script pub key with the provided h160 value.
        else if (
          stack.length === 2 &&
          (stack[0] as Buffer).length === 0 &&
          (stack[1] as Buffer).length === 20
        ) {
          // pop the hash and the op_0 off the stack
          const h160 = stack.pop();
          stack.pop();

          // push the witness data onto the commands, which will include two
          // values: <sig>, <pubkey>
          cmds.push(...witness);

          // create a P2PKH script using the h160 (pubkey) that was provided
          // in the original script_pubkey
          cmds.push(...p2pkhScript(h160).cmds);
        }
      }
    }

    // fails if there is nothing left on the stack
    if (stack.length === 0) {
      // LOG FAILURE
      return false;
    }

    // the stack will store a false value as an empty byte array
    if (Buffer.alloc(0).equals(stack.pop())) {
      // LOG FAILURE
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
    const scriptData = this.serializeCmds();
    const scriptDataLen = encodeVarint(BigInt(scriptData.length));
    return combine(scriptDataLen, scriptData);
  }

  /**
   * Serializes the Operations and Elements in the script stack
   */
  public serializeCmds(): Buffer {
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
   * Returns the hash160 of the serialized commands. This method is useful
   * for P2SH transactions
   */
  public hash160(): Buffer {
    return hash160(this.serializeCmds());
  }

  /**
   * Returns the sha256 hash of the serialized commands. This methodo is useful
   * for P2WSH transactions.
   */
  public sha256(): Buffer {
    return sha256(this.serializeCmds());
  }

  /**
   * Creates a base58check encoded address using the hash160 value of the
   * script. It uses the prefix 0x05 for mainnet which results in addresses
   * that start with 3 in Base58. Testnet uses a prefix of 0xc4 and starts with
   * and address of 2.
   * @param testnet
   */
  public address(testnet: boolean = false): string {
    if (this.isP2shScriptPubKey()) {
      return p2shAddress(this.hash160(), testnet);
    } else if (this.isP2pkhScriptPubKey()) {
      return p2pkhAddress(this.cmds[2] as Buffer, testnet);
    }
  }

  /**
   * Returns true if the script matches the pattern for a P2SH script pubkey
   * which is three elements:
   *
   *  OP_HASH160
   *  <hash 20-bytes>
   *  OP_EQUAL
   */
  public isP2shScriptPubKey(): boolean {
    return (
      this.cmds.length === 3 &&
      this.cmds[0] === OpCode.OP_HASH160 &&
      (this.cmds[1] as Buffer).length === 20 &&
      this.cmds[2] === OpCode.OP_EQUAL
    );
  }

  /**
   * Returns true if the script matches the pattern for a P2PKH script pubkey
   * which has 4 elements:
   *
   * OP_DUP
   * OP_HASH160
   * OP_PUSHBYTES_20 <hash>
   * OP_EQUALVERIFY,
   * OP_CHECKSIG
   */
  public isP2pkhScriptPubKey(): boolean {
    return (
      this.cmds.length === 5 &&
      this.cmds[0] === OpCode.OP_DUP &&
      this.cmds[1] === OpCode.OP_HASH160 &&
      (this.cmds[2] as Buffer).length === 20 &&
      this.cmds[3] === OpCode.OP_EQUALVERIFY &&
      this.cmds[4] === OpCode.OP_CHECKSIG
    );
  }

  /**
   * Returns true if the ScriptPubKey matches the pattern for a P2WPKH script
   * which has 2 elements:
   *
   * OP_0
   * OP_PUSHBYTES_20 <h160>
   */
  public isP2wpkhScriptPubKey(): boolean {
    return (
      this.cmds.length === 2 &&
      this.cmds[0] === OpCode.OP_0 &&
      (this.cmds[1] as Buffer).length === 20
    );
  }
}
