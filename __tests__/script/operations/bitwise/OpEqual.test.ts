import { expect } from "chai";
import { opEqual } from "../../../../src/script/operations/bitwise/OpEqual";
import { decodeNum } from "../../../../src/script/NumCodec";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opEqual", () => {
  testStackLen(opEqual, 2);

  it("pushes 0 when a != b", () => {
    const stack = [Buffer.from([0x01, 0x01]), Buffer.from([0x00, 0x01])];
    expect(opEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(0n);
  });

  it("pushes 1 when a == b", () => {
    const stack = [Buffer.from([0x01, 0x01]), Buffer.from([0x01, 0x01])];
    expect(opEqual(stack)).to.equal(true);
    expect(decodeNum(stack[0])).to.equal(1n);
  });
});
