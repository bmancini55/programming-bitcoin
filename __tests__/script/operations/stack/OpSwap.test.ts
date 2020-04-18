import { expect } from "chai";
import { testStackLen } from "../_OperationUtils";
import { opSwap } from "../../../../src/script/operations/stack/OpSwap";

describe("Operation: opSwap", () => {
  testStackLen(opSwap, 2);

  it("swaps the top two values on the stack", () => {
    const stack = [Buffer.from([0x01]), Buffer.from([0x02])];
    expect(opSwap(stack)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x02]));
    expect(stack[1]).to.deep.equal(Buffer.from([0x01]));
  });
});
