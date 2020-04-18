import { expect } from "chai";
import { opHash160 } from "../../../../src/script/operations/crypto/OpHash160";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opHash160", () => {
  testStackLen(opHash160, 1);

  it("pushes the hash160 of the value", () => {
    const stack = [Buffer.from("test")];
    expect(opHash160(stack)).to.equal(true);
    expect(stack[0].toString("hex")).to.deep.equal(
      "cebaa98c19807134434d107b0d3e5692a516ea66"
    );
  });
});
