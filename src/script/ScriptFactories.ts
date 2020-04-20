import { Script } from "./Script";
import { OpCode } from "./OpCode";
import { combineLE } from "../util/BufferUtil";

export function p2pkhScript(h160: Buffer): Script {
  return new Script([
    OpCode.OP_DUP,
    OpCode.OP_HASH160,
    h160,
    OpCode.OP_EQUALVERIFY,
    OpCode.OP_CHECKSIG,
  ]);
}

export function p2msScript(m: bigint, n: bigint, ...pubkeys: Buffer[]): Script {
  return new Script([
    0x50 + Number(m),
    ...pubkeys,
    0x50 + Number(n),
    OpCode.OP_CHECKMULTISIG,
  ]); // prettier-ignore
}

export function p2shScript(h160: Buffer): Script {
  return new Script([
    OpCode.OP_HASH160,
    h160,
    OpCode.OP_EQUAL,
  ]); // prettier-ignore
}
