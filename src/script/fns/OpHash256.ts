import { hash256 } from "../../util/Hash256";
import { ScriptCmd } from "../ScriptCmd";

export function opHash256(stack: ScriptCmd[]): boolean {
  // return false when stack is empty
  if (!stack.length) {
    return false;
  }

  // pop element off stack
  const element: Buffer = stack.pop() as Buffer;

  // ensure element is a buffer
  if (!Buffer.isBuffer(element)) {
    return false;
  }

  // push the element on the stack
  stack.push(hash256(element));

  // return true
  return true;
}
