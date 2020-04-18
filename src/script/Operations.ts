// tslint:disable: variable-name
import { OpCode } from "./OpCode";
import { opDup } from "./operations/stack/OpDup";
import { opHash160 } from "./operations/crypto/OpHash160";
import { opHash256 } from "./operations/crypto/OpHash256";
import { op0 } from "./operations/OpNumber";
import { op1 } from "./operations/OpNumber";
import { op2 } from "./operations/OpNumber";
import { op3 } from "./operations/OpNumber";
import { op4 } from "./operations/OpNumber";
import { op5 } from "./operations/OpNumber";
import { op6 } from "./operations/OpNumber";
import { op7 } from "./operations/OpNumber";
import { op8 } from "./operations/OpNumber";
import { op9 } from "./operations/OpNumber";
import { op10 } from "./operations/OpNumber";
import { op11 } from "./operations/OpNumber";
import { op12 } from "./operations/OpNumber";
import { op13 } from "./operations/OpNumber";
import { op14 } from "./operations/OpNumber";
import { op15 } from "./operations/OpNumber";
import { op16 } from "./operations/OpNumber";
import { opSwap } from "./operations/stack/OpSwap";
import { opCheckSig } from "./operations/crypto/OpCheckSig";
import { opCheckSigVerify } from "./operations/crypto/OpCheckSigVerify";
import { opEqual } from "./operations/bitwise/OpEqual";
import { opEqualVerify } from "./operations/bitwise/OpEqualVerify";
import { op1Add } from "./operations/arithmetic/Op1Add";
import { op1Sub } from "./operations/arithmetic/Op1Sub";
import { opNegate } from "./operations/arithmetic/OpNegate";
import { opAbs } from "./operations/arithmetic/OpAbs";
import { opNot } from "./operations/arithmetic/OpNot";
import { op0NotEqual } from "./operations/arithmetic/Op0NotEqual";
import { opAdd } from "./operations/arithmetic/OpAdd";
import { opSub } from "./operations/arithmetic/OpSub";
import { opBoolAnd } from "./operations/arithmetic/OpBoolAnd";
import { opBoolOr } from "./operations/arithmetic/OpBoolOr";
import { opNumEqual } from "./operations/arithmetic/OpNumEqual";
import { opNumEqualVerify } from "./operations/arithmetic/OpNumEqualVerify";
import { opNumNotEqual } from "./operations/arithmetic/OpNumNotEqual";
import { opLessThan } from "./operations/arithmetic/OpLessThan";
import { opGreaterThan } from "./operations/arithmetic/OpGreaterThan";
import { opLessThanOrEqual } from "./operations/arithmetic/OpLessThanOrEqual";
import { opGreaterThanOrEqual } from "./operations/arithmetic/OpGreaterThanOrEqual";
import { opMin } from "./operations/arithmetic/opMin";
import { opMax } from "./operations/arithmetic/OpMax";
import { opWithin } from "./operations/arithmetic/OpWithin";

export const Operations = {
  [OpCode.OP_FALSE]: op0,
  [OpCode.OP_TRUE]: op1,

  [OpCode.OP_0]: op0,
  [OpCode.OP_1]: op1,
  [OpCode.OP_2]: op2,
  [OpCode.OP_3]: op3,
  [OpCode.OP_4]: op4,
  [OpCode.OP_5]: op5,
  [OpCode.OP_6]: op6,
  [OpCode.OP_7]: op7,
  [OpCode.OP_8]: op8,
  [OpCode.OP_9]: op9,
  [OpCode.OP_10]: op10,
  [OpCode.OP_11]: op11,
  [OpCode.OP_12]: op12,
  [OpCode.OP_13]: op13,
  [OpCode.OP_14]: op14,
  [OpCode.OP_15]: op15,
  [OpCode.OP_16]: op16,

  [OpCode.OP_DUP]: opDup,
  [OpCode.OP_SWAP]: opSwap,

  [OpCode.OP_EQUAL]: opEqual,
  [OpCode.OP_EQUALVERIFY]: opEqualVerify,

  // Arithmetic
  [OpCode.OP_1ADD]: op1Add,
  [OpCode.OP_1SUB]: op1Sub,
  [OpCode.OP_NEGATE]: opNegate,
  [OpCode.OP_ABS]: opAbs,
  [OpCode.OP_NOT]: opNot,
  [OpCode.OP_0NOTEQUAL]: op0NotEqual,
  [OpCode.OP_ADD]: opAdd,
  [OpCode.OP_SUB]: opSub,
  [OpCode.OP_BOOLAND]: opBoolAnd,
  [OpCode.OP_BOOLOR]: opBoolOr,
  [OpCode.OP_NUMEQUAL]: opNumEqual,
  [OpCode.OP_NUMEQUALVERIFY]: opNumEqualVerify,
  [OpCode.OP_NUMNOTEQUAL]: opNumNotEqual,
  [OpCode.OP_LESSTHAN]: opLessThan,
  [OpCode.OP_GREATERTHAN]: opGreaterThan,
  [OpCode.OP_LESSTHANOREQUAL]: opLessThanOrEqual,
  [OpCode.OP_GREATERTHANOREQUAL]: opGreaterThanOrEqual,
  [OpCode.OP_MIN]: opMin,
  [OpCode.OP_MAX]: opMax,
  [OpCode.OP_WITHIN]: opWithin,

  // Crypto
  [OpCode.OP_HASH160]: opHash160,
  [OpCode.OP_HASH256]: opHash256,

  [OpCode.OP_CHECKSIG]: opCheckSig,
  [OpCode.OP_CHECKSIGVERIFY]: opCheckSigVerify,
};
