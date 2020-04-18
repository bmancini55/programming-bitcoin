import { expect } from "chai";
import { op1Add } from "../../../../src/script/operations/arithmetic/Op1Add";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: op1Add", () => {
  testStackLen(op1Add, 1);

  it("success pushes a+1 onto stack", () => {
    const stack = [encodeNum(1n)];
    expect(op1Add(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(2n);
  });
});
