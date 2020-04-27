import { expect } from "chai";
import * as varint from "../../src/util/Varint";
import { bufToStream } from "../../src/util/BufferUtil";

describe("Varint", () => {
  const tests: [Buffer, bigint][] = [
    [Buffer.from("00", "hex"), BigInt(0x00)],
    [Buffer.from("01", "hex"), BigInt(0x01)],
    [Buffer.from("fc", "hex"), BigInt(0xfc)],
    [Buffer.from("fd0001", "hex"), BigInt(0x0100)],
    [Buffer.from("fdffff", "hex"), BigInt(0xffff)],
    [Buffer.from("fe00000001", "hex"), BigInt(0x01000000)],
    [Buffer.from("feffffffff", "hex"), BigInt(0xffffffff)],
    [Buffer.from("ff0000000000000001", "hex"), BigInt("0x0100000000000000")],
    [Buffer.from("ffffffffffffffffff", "hex"), BigInt("0xffffffffffffffff")],
  ];

  describe("decodeVarint", () => {
    for (const test of tests) {
      it(`0x${test[0].toString("hex")} => ${test[1]}`, () => {
        const actual = varint.decodeVarint(bufToStream(test[0]));
        expect(actual.toString()).to.equal(test[1].toString());
      });
    }
  });

  describe("encodeVarint", () => {
    for (const test of tests) {
      it(`${test[1]} => 0x${test[0].toString("hex")}`, () => {
        const actual = varint.encodeVarint(test[1]);
        expect(actual.toString("hex")).to.equal(test[0].toString("hex"));
      });
    }
  });
});
