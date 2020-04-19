import { expect } from "chai";
import { opSha1 } from "../../../../src/script/operations/crypto/OpSha1";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opSha1", () => {
  testStackLen(opSha1, 1);

  it("pushes the sha1 of the value", () => {
    const stack = [Buffer.from("test")];
    expect(opSha1(stack)).to.equal(true);
    expect(stack[0].toString("hex")).to.deep.equal(
      "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"
    );
  });
});
