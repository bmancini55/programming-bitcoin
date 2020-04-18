import { expect } from "chai";
import { opNumNotEqual } from "../../../../src/script/fns/arithmetic/opNumNotEqual";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opNumNotEqual", () => {
  testStackLen(opNumNotEqual, 2);

  it("pushes 1 when a != b", () => {
    const stack = [encodeNum(1n), encodeNum(0n)];
    expect(opNumNotEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 0 when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opNumNotEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });
});
