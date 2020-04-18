import { decodeNum, encodeNum } from "../../NumCodec";

/**
 * Performs a numeric addition of the top two elements and
 * pushes the result onto the stack
 * @param stack
 */
export function opAdd(stack: Buffer[]): boolean {
  if (stack.length < 2) return false;

  const a = decodeNum(stack.pop());
  const b = decodeNum(stack.pop());
  stack.push(encodeNum(a + b));

  return true;
}
