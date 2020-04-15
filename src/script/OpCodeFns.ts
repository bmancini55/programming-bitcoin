// tslint:disable: variable-name
import { OpCode } from "./OpCode";
import { opDup } from "./fns/OpDup";
import { opHash160 } from "./fns/OpHash160";
import { opHash256 } from "./fns/OpHash256";
import { opCheckSig } from "./fns/OpCheckSig";
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

export const OpCodeFns = {
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
  [OpCode.OP_HASH160]: opHash160,
  [OpCode.OP_HASH256]: opHash256,
  [OpCode.OP_CHECKSIG]: opCheckSig,
};
