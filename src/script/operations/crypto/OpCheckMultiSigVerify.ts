import { opVerify } from "../flowcontrol/OpVerify";
import { opCheckMultiSig } from "./OpCheckMultiSig";

/**
 * Performs OP_CHECKMULTISIG and then performs an OP_VERIFY.
 * @param stack
 */
export function opCheckMultiSigVerify(stack: Buffer[], z: Buffer): boolean {
  return opCheckMultiSig(stack, z) && opVerify(stack);
}
