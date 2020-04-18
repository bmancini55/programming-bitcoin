/**
 * Swaps the top two elements on the stack
 * @param stack
 */
export function opSwap(stack: Buffer[]): boolean {
  if (stack.length < 2) {
    return false;
  }

  const a = stack.pop();
  const b = stack.pop();
  stack.push(a);
  stack.push(b);

  return true;
}
