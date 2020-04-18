import { expect } from "chai";
import { testStackLen } from "../_OperationUtils";
import { opVerify } from "../../../../src/script/operations/flowcontrol/OpVerify";

describe("Operation: opVerify", () => {
  testStackLen(opVerify, 1);

  it("returns false when top of stack 0", () => {
    const stack = [Buffer.alloc(0)];
    expect(opVerify(stack)).to.equal(false);
  });

  it("returns true when top of stack is 1", () => {
    const stack = [Buffer.from([0x01])];
    expect(opVerify(stack)).to.equal(true);
  });

  it("returns true when top of stack is any value", () => {
    const stack = [Buffer.alloc(32)];
    expect(opVerify(stack)).to.equal(true);
  });
});
