import { hash256 } from "../../util/Hash256";
import { ScriptPart } from "../ScriptPart";

export function opHash256(stack: ScriptPart[]): boolean {
  // return false when stack is empty
  if (!stack.length) {
    return false;
  }

  // pop element off stack
  const element = stack.pop();

  // ensure element is a buffer
  let data: Buffer;
  if (typeof element === "number") {
    data = Buffer.from([element]);
  } else {
    data = element as Buffer;
  }

  // push the element on the stack
  stack.push(hash256(data));

  // return true
  return true;
}
