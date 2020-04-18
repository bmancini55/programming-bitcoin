import { opEqual } from "./OpEqual";
import { opVerify } from "./OpVerify";

/**
 * Reads two values from the stack and checks it they are bitwise equal.
 * It pushes 1 onto the stack if it was successful and 0 onto the stack
 * if it was a failure.
 * @param stack
 */
export function opEqualVerify(stack: Buffer[]): boolean {
  if (!opEqual(stack)) {
    return false;
  }

  if (!opVerify(stack)) {
    return false;
  }

  return true;
}
