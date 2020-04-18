import { decodeNum, encodeNum } from "../../NumCodec";
import { opNumEqual } from "./OpNumEqual";
import { opVerify } from "../OpVerify";

/**
 * Pops two elements off the stack and pushes nothing or fails.
 * Same as OP_NUMEQUAL, but runs OP_VERIFY afterward.
 * @param stack
 */
export function opNumEqualVerify(stack: Buffer[]): boolean {
  return opNumEqual(stack) && opVerify(stack);
}
