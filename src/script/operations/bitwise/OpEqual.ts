import { op0 } from "../OpNumber";
import { op1 } from "../OpNumber";

/**
 * Reads two values from the stack and checks it they are bitwise equal.
 * It pushes 1 onto the stack if it was successful and 0 onto the stack
 * if it was a failure.
 * @param stack
 */
export function opEqual(stack: Buffer[]): boolean {
  if (stack.length < 2) {
    return false;
  }

  const a = stack.pop();
  const b = stack.pop();
  const result = a.equals(b);

  if (!result) {
    op0(stack);
  } else {
    op1(stack);
  }

  return true;
}
