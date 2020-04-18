import { opVerify } from "./OpVerify";
import { opCheckSig } from "./OpCheckSig";

/**
 * Performs OP_CHECKSIG and then performs an OP_VERIFY.
 * @param stack
 */
export function opCheckSigVerify(stack: Buffer[], z: Buffer): boolean {
  if (!opCheckSig(stack, z)) {
    return false;
  }

  if (!opVerify(stack)) {
    return false;
  }

  return true;
}
