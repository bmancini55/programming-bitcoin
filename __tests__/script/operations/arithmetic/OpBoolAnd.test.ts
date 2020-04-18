import { expect } from "chai";
import { opBoolAnd } from "../../../../src/script/operations/arithmetic/OpBoolAnd";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opBoolAnd", () => {
  testStackLen(opBoolAnd, 2);

  it("pushes 0 when a=0", () => {
    const stack = [encodeNum(1n), encodeNum(0n)];
    expect(opBoolAnd(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 0 when b=0", () => {
    const stack = [encodeNum(0n), encodeNum(1n)];
    expect(opBoolAnd(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when a!=0 and b!=0", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opBoolAnd(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
