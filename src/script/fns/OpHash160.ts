import { hash160 } from "../../util/Hash160";
import { ScriptPart } from "../ScriptPart";
import { ScriptData } from "../ScriptData";

/**
 * Performs a hash160 on the
 * @param stack
 */
export function opHash160(stack: ScriptPart[]): boolean {
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

  // push hashed element onto stack
  stack.push(hash160(data));

  // return true
  return true;
}
