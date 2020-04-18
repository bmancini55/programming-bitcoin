import { expect } from "chai";
import { testStackLen } from "../_OperationUtils";
import { opDup } from "../../../../src/script/operations/stack/OpDup";

describe("Operation: opDup", () => {
  testStackLen(opDup, 1);

  it("pushes the top value onto the stack", () => {
    const stack = [Buffer.from([0x01])];
    expect(opDup(stack)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x01]));
    expect(stack[1]).to.deep.equal(Buffer.from([0x01]));
  });
});
