import { S256Point } from "../../../ecc/S256Point";
import { bigFromBuf } from "../../../util/BigIntUtil";
import { Signature } from "../../../ecc/Signature";
import { op0 } from "../OpNumber";
import { op1 } from "../OpNumber";

export function opCheckSig(stack: Buffer[], z: Buffer): boolean {
  // return false when stack is empty
  if (stack.length < 2) {
    return false;
  }

  // pop the pubkey bytes off the stack
  const pkBuf = stack.pop();

  // pop the signature and pubkey off the stack
  const sigBuf = stack.pop();

  // parse pk and sig
  let pk: S256Point;
  let sig: Signature;
  try {
    pk = S256Point.parse(pkBuf);
    sig = Signature.parse(sigBuf.slice(0, sigBuf.length - 1));
  } catch (ex) {
    return op0(stack);
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
