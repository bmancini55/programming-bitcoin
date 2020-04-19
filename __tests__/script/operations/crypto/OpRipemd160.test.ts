import { expect } from "chai";
import { opRipemd160 } from "../../../../src/script/operations/crypto/OpRipemd160";
import { testStackLen } from "../_OperationUtils";

describe("Operation: opRipemd160", () => {
  testStackLen(opRipemd160, 1);

  it("pushes the ripemd160 of the value", () => {
    const stack = [Buffer.from("test")];
    expect(opRipemd160(stack)).to.equal(true);
    expect(stack[0].toString("hex")).to.deep.equal(
      "5e52fee47e6b070565f74372468cdc699de89107"
    );
  });
});
