import { expect } from "chai";
import { opNumEqual } from "../../../../src/script/fns/arithmetic/OpNumEqual";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opNumEqual", () => {
  testStackLen(opNumEqual, 2);

  it("pushes 0 when a != b", () => {
    const stack = [encodeNum(1n), encodeNum(0n)];
    expect(opNumEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opNumEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
