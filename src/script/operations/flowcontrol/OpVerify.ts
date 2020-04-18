/**
 * Returns false when there is nothing on the stack or when
 * the top element of the stack is op_0/op_false. Removes the
 * top element.
 * @param stack
 */
export function opVerify(stack: Buffer[]): boolean {
  if (!stack.length) {
    return false;
  }

  if (Buffer.alloc(0).equals(stack.pop())) {
    return false;
  }

  return true;
}
