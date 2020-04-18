import { expect } from "chai";
import { opLessThan } from "../../../../src/script/operations/arithmetic/OpLessThan";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opLessThan", () => {
  testStackLen(opLessThan, 2);

  it("pushes 0 when a > b", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opLessThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 0 when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opLessThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when a < b", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opLessThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
