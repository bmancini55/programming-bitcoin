import { encodeNum } from "../NumCodec";
import { ScriptCmd } from "../ScriptCmd";

/**
 * Number zero which pushes an empty byte array onto the stack
 * @param stack
 */
export function op0(stack: ScriptCmd[]): boolean {
  stack.push(encodeNum(0n));
  return true;
}
