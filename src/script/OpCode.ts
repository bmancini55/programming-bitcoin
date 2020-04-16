import { hash256 } from "../util/Hash256";
import { hash160 } from "../util/Hash160";

export enum OpCode {
  // Constants
  OP_0 = 0, // 0x00
  OP_FALSE = 0, // 0x00
  OP_PUSHDATA1 = 76, // 0x4c
  OP_PUSHDATA2 = 77, // 0x4d
  OP_1 = 81, // 0x51
  OP_TRUE = 81, // 0x51
  OP_2 = 82, // 0x52
  OP_3 = 83, // 0x53
  OP_4 = 84, // 0x54
  OP_5 = 85, // 0x55
  OP_6 = 86, // 0x56
  OP_7 = 87, // 0x57
  OP_8 = 88, // 0x58
  OP_9 = 89, // 0x50
  OP_10 = 90, // 0x5a
  OP_11 = 91, // 0x5b
  OP_12 = 92, // 0x5c
  OP_13 = 93, // 0x5d
  OP_14 = 94, // 0x5e
  OP_15 = 95, // 0x5f
  OP_16 = 96, // 0x60

  // Flow Control
  OP_IF = 99, // 0x63
  OP_NOTIF = 100, // 0x64

  // Stack
  OP_TOALTSTACK = 107, // 0x6b
  OP_FROMALTSTACK = 108, // 0x6c
  OP_DUP = 118, // 0x76
  OP_SWAP = 124, // 0x7c

  // Bitwise
  OP_EQUAL = 135, // 0x87
  OP_EQUALVERIFY = 136, // 0x88

  // Crypto
  OP_HASH160 = 169, // 0xa9
  OP_HASH256 = 170, // 0xaa
  OP_CHECKSIG = 172, // 0xac
  OP_CHECKSIGVERIFY = 173, // 0xad
  OP_CHECKMULTISIG = 174, // 0xae
  OP_CHECKMULTISIGVERIFY = 175, // 0xaf
}
