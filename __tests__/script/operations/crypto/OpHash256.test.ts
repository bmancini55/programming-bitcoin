import { expect } from "chai";
import { opHash256 } from "../../../../src/script/operations/crypto/OpHash256";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opHash256", () => {
  testStackLen(opHash256, 1);

  it("pushes the hash160 of the value", () => {
    const stack = [Buffer.from("test")];
    expect(opHash256(stack)).to.equal(true);
    expect(stack[0].toString("hex")).to.deep.equal(
      "954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4"
    );
  });
});
