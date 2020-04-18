import { expect } from "chai";
import { opEqualVerify } from "../../../../src/script/operations/bitwise/OpEqualVerify";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opEqualVerify", () => {
  testStackLen(opEqualVerify, 2);

  it("returns false when a != b", () => {
    const stack = [Buffer.from([0x01, 0x01]), Buffer.from([0x00, 0x01])];
    expect(opEqualVerify(stack)).to.equal(false);
  });

  it("returns true when a == b", () => {
    const stack = [Buffer.from([0x01, 0x01]), Buffer.from([0x01, 0x01])];
    expect(opEqualVerify(stack)).to.equal(true);
  });
});
