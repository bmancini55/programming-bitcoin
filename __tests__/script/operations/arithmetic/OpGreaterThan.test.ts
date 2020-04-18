import { expect } from "chai";
import { opGreaterThan } from "../../../../src/script/fns/arithmetic/OpGreaterThan";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opGreaterThan", () => {
  testStackLen(opGreaterThan, 2);

  it("pushes 1 when a > b", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opGreaterThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 0 when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opGreaterThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 0 when a < b", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opGreaterThan(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });
});
