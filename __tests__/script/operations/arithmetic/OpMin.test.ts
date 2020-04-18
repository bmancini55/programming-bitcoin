import { expect } from "chai";
import { opMin } from "../../../../src/script/operations/arithmetic/OpMin";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opMin", () => {
  testStackLen(opMin, 2);

  it("pushes a when a < b", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opMin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes b when b < a", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opMin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
