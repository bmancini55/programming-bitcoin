import { S256Point } from "../../ecc/S256Point";
import { bigFromBuf } from "../../util/BigIntUtil";
import { Signature } from "../../ecc/Signature";
import { ScriptCmd } from "../ScriptCmd";
import { encodeNum } from "../NumCodec";
import { op1 } from "./Op1";
import { op0 } from "./Op0";

export function opCheckSig(stack: ScriptCmd[], z: Buffer): boolean {
  // return false when stack is empty
  if (!stack.length) {
    return false;
  }

  // pop the pubkey bytes off the stack
  const pkBuf: Buffer = stack.pop() as Buffer;
  if (!Buffer.isBuffer(pkBuf)) {
    return false;
  }

  // pop the signature and pubkey off the stack
  const sigBuf: Buffer = stack.pop() as Buffer;
  if (!Buffer.isBuffer(sigBuf)) {
    return false;
  }

  // parse pk and sig
  let pk: S256Point;
  let sig: Signature;
  try {
    pk = S256Point.parse(pkBuf);
    sig = Signature.parse(sigBuf.slice(0, sigBuf.length - 1));
  } catch (ex) {
    return false;
  }

  // verify the signature and push a true or false onto the stack
  if (pk.verify(bigFromBuf(z), sig)) {
    op1(stack);
  } else {
    op0(stack);
  }

  // return true that it was successful
  return true;
}
