import { opVerify } from "../flowcontrol/OpVerify";
import { opCheckSig } from "./OpCheckSig";

/**
 * Performs OP_CHECKSIG and then performs an OP_VERIFY.
 * @param stack
 */
export function opCheckSigVerify(stack: Buffer[], z: Buffer): boolean {
  return opCheckSig(stack, z) && opVerify(stack);
}
