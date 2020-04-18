import { expect } from "chai";
import { opNegate } from "../../../../src/script/fns/arithmetic/OpNegate";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opNegate", () => {
  testStackLen(opNegate, 1);

  it("success pushes negation onto stack", () => {
    const stack = [encodeNum(3n)];
    expect(opNegate(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(-3n);
  });

  it("success pushes negation onto stack", () => {
    const stack = [encodeNum(-3n)];
    expect(opNegate(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(3n);
  });
});
