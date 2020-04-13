// tslint:disable: variable-name
import { OpCode } from "../OpCode";
import { opDup } from "./OpDup";
import { opHash160 } from "./OpHash160";
import { opHash256 } from "./OpHash256";
import { opCheckSig } from "./OpCheckSig";
import { op0 } from "./Op0";
import { op1 } from "./Op1";

export const OpCodeMap = {
  [OpCode.OP_0]: op0,
  [OpCode.OP_1]: op1,
  [OpCode.OP_DUP]: opDup,
  [OpCode.OP_HASH160]: opHash160,
  [OpCode.OP_HASH256]: opHash256,
  [OpCode.OP_CHECKSIG]: opCheckSig,
};
