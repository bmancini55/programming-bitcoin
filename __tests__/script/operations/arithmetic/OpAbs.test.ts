import { expect } from "chai";
import { opAbs } from "../../../../src/script/operations/arithmetic/OpAbs";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opAbs", () => {
  testStackLen(opAbs, 1);

  it("success pushes absolute value of negative onto stack", () => {
    const stack = [encodeNum(-3n)];
    expect(opAbs(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(3n);
  });

  it("success pushes absolute value of positive onto stack", () => {
    const stack = [encodeNum(3n)];
    expect(opAbs(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(3n);
  });
});
