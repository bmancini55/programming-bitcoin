import { expect } from "chai";
import { opNumEqualVerify } from "../../../../src/script/fns/arithmetic/OpNumEqualVerify";
import { encodeNum, decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opNumEqualVerify", () => {
  testStackLen(opNumEqualVerify, 2);

  it("returns false when a != b", () => {
    const stack = [encodeNum(1n), encodeNum(0n)];
    expect(opNumEqualVerify(stack)).to.equal(false);
  });

  it("returns true when a == b", () => {
    const stack = [encodeNum(1n), encodeNum(1n)];
    expect(opNumEqualVerify(stack)).to.equal(true);
  });
});
