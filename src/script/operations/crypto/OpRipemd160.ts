import crypto from "crypto";

/**
 * Pops an item off the stack and pushes the results onto the stack.
 * The input is hashed using RIPEMD-160.
 * @param stack
 */
export function opRipemd160(stack: Buffer[]): boolean {
  if (!stack.length) {
    return false;
  }

  const input = stack.pop();
  const output = crypto.createHash("ripemd160").update(input).digest();
  stack.push(output);

  return true;
}
