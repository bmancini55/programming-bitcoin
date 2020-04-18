import { expect } from "chai";
import { opNot } from "../../../../src/script/operations/arithmetic/OpNot";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opNot", () => {
  testStackLen(opNot, 1);

  it("success pushes 1n when 0n onto stack", () => {
    const stack = [encodeNum(1n)];
    expect(opNot(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("success pushes 0n when 1n onto stack", () => {
    const stack = [encodeNum(0n)];
    expect(opNot(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("success pushes 0n onto stack", () => {
    const stack = [encodeNum(55n)];
    expect(opNot(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });
});
