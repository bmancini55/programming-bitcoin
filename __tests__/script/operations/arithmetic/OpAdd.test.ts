import { expect } from "chai";
import { opAdd } from "../../../../src/script/operations/arithmetic/OpAdd";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opAdd", () => {
  testStackLen(opAdd, 2);

  it("success pushes sum onto stack", () => {
    const stack = [encodeNum(1n), encodeNum(2n)];
    expect(opAdd(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(3n);
  });
});
