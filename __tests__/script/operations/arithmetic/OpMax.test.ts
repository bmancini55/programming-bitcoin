import { expect } from "chai";
import { opMax } from "../../../../src/script/operations/arithmetic/OpMax";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opMax", () => {
  testStackLen(opMax, 2);

  it("pushes a when a > b", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opMax(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(2n);
  });

  it("pushes b when b > a", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opMax(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(2n);
  });
});
