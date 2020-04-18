import { expect } from "chai";
import { op1Sub } from "../../../../src/script/operations/arithmetic/Op1Sub";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: op1Sub", () => {
  testStackLen(op1Sub, 1);

  it("success pushes a-1 onto stack", () => {
    const stack = [encodeNum(3n)];
    expect(op1Sub(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(2n);
  });
});
