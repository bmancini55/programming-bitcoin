import { expect } from "chai";
import { opSub } from "../../../../src/script/fns/arithmetic/OpSub";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opSub", () => {
  testStackLen(opSub, 2);

  it("success pushes difference onto stack", () => {
    const stack = [encodeNum(2n), encodeNum(1n)];
    expect(opSub(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
