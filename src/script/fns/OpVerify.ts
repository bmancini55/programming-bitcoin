import { encodeNum } from "../NumCodec";
import { ScriptCmd } from "../ScriptCmd";

/**
 * Verifies that the stack has a value
 * @param stack
 */
export function opVerify(stack: ScriptCmd[]): boolean {
  if (!stack.length) return false;
  if (Buffer.alloc(0).equals(stack[0] as Buffer)) return false;
  return true;
}
