// tslint:disable: variable-name
import { OpCode } from "./OpCode";
import { opDup } from "./fns/OpDup";
import { opHash160 } from "./fns/OpHash160";
import { opHash256 } from "./fns/OpHash256";
import { op0 } from "./fns/OpNumber";
import { op1 } from "./fns/OpNumber";
import { op2 } from "./fns/OpNumber";
import { op3 } from "./fns/OpNumber";
import { op4 } from "./fns/OpNumber";
import { op5 } from "./fns/OpNumber";
import { op6 } from "./fns/OpNumber";
import { op7 } from "./fns/OpNumber";
import { op8 } from "./fns/OpNumber";
import { op9 } from "./fns/OpNumber";
import { op10 } from "./fns/OpNumber";
import { op11 } from "./fns/OpNumber";
import { op12 } from "./fns/OpNumber";
import { op13 } from "./fns/OpNumber";
import { op14 } from "./fns/OpNumber";
import { op15 } from "./fns/OpNumber";
import { op16 } from "./fns/OpNumber";
import { opSwap } from "./fns/OpSwap";
import { opCheckSig } from "./fns/OpCheckSig";
import { opCheckSigVerify } from "./fns/OpCheckSigVerify";
import { opEqual } from "./fns/OpEqual";
import { opEqualVerify } from "./fns/OpEqualVerify";
import { op1Add } from "./fns/arithmetic/Op1Add";
import { op1Sub } from "./fns/arithmetic/Op1Sub";
import { opNegate } from "./fns/arithmetic/OpNegate";
import { opAbs } from "./fns/arithmetic/OpAbs";
import { opNot } from "./fns/arithmetic/OpNot";
import { op0NotEqual } from "./fns/arithmetic/Op0NotEqual";
import { opAdd } from "./fns/arithmetic/OpAdd";
import { opSub } from "./fns/arithmetic/OpSub";
import { opBoolAnd } from "./fns/arithmetic/OpBoolAnd";
import { opBoolOr } from "./fns/arithmetic/OpBoolOr";
import { opNumEqual } from "./fns/arithmetic/OpNumEqual";
import { opNumEqualVerify } from "./fns/arithmetic/OpNumEqualVerify";
import { opNumNotEqual } from "./fns/arithmetic/OpNumNotEqual";
import { opLessThan } from "./fns/arithmetic/OpLessThan";
import { opGreaterThan } from "./fns/arithmetic/OpGreaterThan";
import { opLessThanOrEqual } from "./fns/arithmetic/OpLessThanOrEqual";
import { opGreaterThanOrEqual } from "./fns/arithmetic/OpGreaterThanOrEqual";
import { opMin } from "./fns/arithmetic/opMin";
import { opMax } from "./fns/arithmetic/OpMax";
import { opWithin } from "./fns/arithmetic/OpWithin";

export const OpCodeFns = {
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
