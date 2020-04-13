// tslint:disable: variable-name
import { OpCode } from "../OpCode";
import { opDup } from "./OpDup";
import { opHash160 } from "./OpHash160";
import { opHash256 } from "./OpHash256";

export const OpCodeMap = {
  [OpCode.OP_DUP]: opDup,
  [OpCode.OP_HASH160]: opHash160,
  [OpCode.OP_HASH256]: opHash256,
};
