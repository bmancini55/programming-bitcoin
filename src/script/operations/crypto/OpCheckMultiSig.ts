import { S256Point } from "../../../ecc/S256Point";
import { bigFromBuf } from "../../../util/BigIntUtil";
import { Signature } from "../../../ecc/Signature";
import { op0 } from "../OpNumber";
import { op1 } from "../OpNumber";
import { decodeNum } from "../../NumCodec";

export function opCheckMultiSig(stack: Buffer[], z: Buffer): boolean {
  if (stack.length < 1) {
    return false;
  }

  // read total number of pubkeys
  const n = decodeNum(stack.pop());

  // ensure n pubkeys are available
  if (stack.length < n) {
    return false;
  }

  // read pubkeys
  const secPubKeys: Buffer[] = [];
  for (let i = 0; i < n; i++) {
    secPubKeys.push(stack.pop());
  }

  // read number of required sigs
  const m = decodeNum(stack.pop());

  // ensure sigs are available
  if (stack.length < m) {
    return false;
  }

  // read sigs
  const derSigs: Buffer[] = [];
  for (let i = 0; i < m; i++) {
    derSigs.push(stack.pop());
  }

  // read off-by-one bug value
  if (!stack.length) {
    return false;
  }
  stack.pop();

  try {
    const pubkeys = secPubKeys.map(p => S256Point.parse(p));
    const sigs = derSigs.map(p => Signature.parse(p.slice(0, p.length - 1)));

    for (const sig of sigs) {
      if (pubkeys.length === 0) {
        op0(stack);
        break;
      }

      while (pubkeys.length) {
        const pubkey = pubkeys.shift();
        if (pubkey.verify(bigFromBuf(z), sig)) {
          break;
        }
      }
    }
    op1(stack);
  } catch (ex) {
    return op0(stack);
  }

  return true;
}
