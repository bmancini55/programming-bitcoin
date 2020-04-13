import { expect } from "chai";
import * as codec from "../../src/script/NumCodec";

describe("NumCodec", () => {
  const tests: [bigint, string][] = [
    [0n, ""],
    [1n, "01"],
    [-1n, "81"],
    [128n, "8000"],
    [129n, "8100"],
    [-129n, "8180"],
    [32785n, "118000"],
    [-32785n, "118080"],
  ]; // prettier-ignore

  describe(".encodeNum()", () => {
    for (const test of tests) {
      it(`${test[0].toString().padStart(8, " ")} => ${test[1]}`, () => {
        expect(codec.encodeNum(test[0]).toString("hex")).to.equal(test[1]);
      });
    }
  });

  describe(".decodeNum()", () => {
    for (const test of tests) {
      it(`${test[1]} => ${test[0]}`, () => {
        expect(
          codec.decodeNum(Buffer.from(test[1], "hex")).toString()
        ).to.equal(test[0].toString());
      });
    }
  });
});
