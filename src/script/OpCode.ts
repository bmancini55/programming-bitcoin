import { hash256 } from "../util/Hash256";
import { hash160 } from "../util/Hash160";

export enum OpCode {
  OP_PUSHDATA1 = 0x4c,
  OP_PUSHDATA2 = 0x4d,
  OP_DUP = 0x76,
  OP_HASH160 = 0xa9,
  OP_HASH256 = 0xaa,
}
