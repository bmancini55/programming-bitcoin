import { expect } from "chai";
import { opSha256 } from "../../../../src/script/operations/crypto/OpSha256";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opSha256", () => {
  testStackLen(opSha256, 1);

  it("pushes the sha256 of the value", () => {
    const stack = [Buffer.from("test")];
    expect(opSha256(stack)).to.equal(true);
    expect(stack[0].toString("hex")).to.deep.equal(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    );
  });
});
