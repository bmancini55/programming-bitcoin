import { expect } from "chai";
import { opWithin } from "../../../../src/script/operations/arithmetic/OpWithin";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opWithin", () => {
  testStackLen(opWithin, 3);

  it("pushes 1 when x within min max", () => {
    const stack = [encodeNum(2n), encodeNum(1n), encodeNum(3n)];
    expect(opWithin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 1 when x = min", () => {
    const stack = [encodeNum(1n), encodeNum(1n), encodeNum(3n)];
    expect(opWithin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });

  it("pushes 0 when x = max", () => {
    const stack = [encodeNum(3n), encodeNum(1n), encodeNum(3n)];
    expect(opWithin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 0 when x < min", () => {
    const stack = [encodeNum(0n), encodeNum(1n), encodeNum(3n)];
    expect(opWithin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 0 when x > max", () => {
    const stack = [encodeNum(4n), encodeNum(1n), encodeNum(3n)];
    expect(opWithin(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });
});
