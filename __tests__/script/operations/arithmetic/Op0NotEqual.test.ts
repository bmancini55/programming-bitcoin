import { expect } from "chai";
import { op0NotEqual } from "../../../../src/script/operations/arithmetic/Op0NotEqual";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: op0NotEqual", () => {
  testStackLen(op0NotEqual, 1);

  it("pushes 0 when input is 0", () => {
    const stack = [encodeNum(0n)];
    expect(op0NotEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when input is not 0", () => {
    const stack = [encodeNum(1n)];
    expect(op0NotEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 1 when input is not 0", () => {
    const stack = [encodeNum(-1n)];
    expect(op0NotEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
