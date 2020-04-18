import { expect } from "chai";
import { opBoolOr } from "../../../../src/script/fns/arithmetic/OpBoolOr";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opBoolOr", () => {
  testStackLen(opBoolOr, 2);

  it("pushes 0 when a=0 and b=0", () => {
    const stack = [encodeNum(0n), encodeNum(0n)];
    expect(opBoolOr(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when b=0", () => {
    const stack = [encodeNum(0n), encodeNum(1n)];
    expect(opBoolOr(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 1 when a=0", () => {
    const stack = [encodeNum(1n), encodeNum(0n)];
    expect(opBoolOr(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 1 when a!=0 and b!=0", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opBoolOr(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
