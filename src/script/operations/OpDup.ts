/**
 * Duplicates the top most element on the stacks
 * @param stack
 */
export function opDup(stack: Buffer[]): boolean {
  // return false when stack is empty
  if (!stack.length) {
    return false;
  }

  // otherwise duplicate the last item on the stack
  stack.push(stack[stack.length - 1]);

  // return true that it was successful
  return true;
}
