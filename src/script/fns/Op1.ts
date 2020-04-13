import { encodeNum } from "../NumCodec";
import { ScriptCmd } from "../ScriptCmd";

/**
 * Number zero which pushes an empty byte array onto the stack
 * @param stack
 */
export function op1(stack: ScriptCmd[]): boolean {
  stack.push(encodeNum(1n));
  return true;
}
