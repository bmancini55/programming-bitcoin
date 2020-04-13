import { hash256 } from "../util/Hash256";
import { hash160 } from "../util/Hash160";

export enum OpCode {
  OP_0 = 0,

  OP_PUSHDATA1 = 76,
  OP_PUSHDATA2 = 77,

  OP_1 = 81,

  OP_IF = 99,
  OP_NOTIF = 100,

  OP_TOALTSTACK = 107,
  OP_FROMALTSTACK = 108,

  OP_DUP = 118,
  OP_HASH160 = 169,
  OP_HASH256 = 170,

  OP_CHECKSIG = 172,
  OP_CHECKSIGVERIFY = 173,
  OP_CHECKMULTISIG = 174,
  OP_CHECKMULTISIGVERIFY = 175,
}
