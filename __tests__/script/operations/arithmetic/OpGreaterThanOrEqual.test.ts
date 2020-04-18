import { expect } from "chai";
import { opGreaterThanOrEqual } from "../../../../src/script/operations/arithmetic/OpGreaterThanOrEqual";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opGreaterThanOrEqualOrEqual", () => {
  testStackLen(opGreaterThanOrEqual, 2);

  it("pushes 1 when a > b", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opGreaterThanOrEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 1 when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opGreaterThanOrEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 0 when a < b", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opGreaterThanOrEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });
});
