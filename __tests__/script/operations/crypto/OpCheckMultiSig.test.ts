import { expect } from "chai";
import { opCheckMultiSig } from "../../../../src/script/operations/crypto/OpCheckMultiSig";
import { testStackLen } from "../_OperationUtils";
import { combine } from "../../../../src/util/BufferUtil";
import { PrivateKey } from "../../../../src/ecc/PrivateKey";
import { bigFromBuf } from "../../../../src/util/BigIntUtil";
import { encodeNum } from "../../../../src/script/NumCodec";

describe("Operation: opCheckMultiSig", () => {
  testStackLen(opCheckMultiSig, 1, Buffer.alloc(65));

  it("push 1 when 1 of 2 sigs", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 1n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const stack = [
      encodeNum(0n),
      combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec(),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x01]));
  });

  it("push 1 when 1 of 2 sigs", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 1n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const stack = [
      encodeNum(0n),
      combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec(),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x01]));
  });

  it("push 1 when 2 of 2 sigs", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 2n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const stack = [
      encodeNum(0n),
      combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec(),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x01]));
  });

  it("push 0 when 0 of 2 sigs", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 2n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const z2 = Buffer.alloc(32, 1);
    const stack = [
      encodeNum(0n),
      combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec(),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z2)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.alloc(0));
  });

  it("push 0 when bad sig", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 2n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const z2 = Buffer.alloc(32, 1);
    const stack = [
      encodeNum(0n),
      combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x01])).slice(1),
      combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec(),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z2)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.alloc(0));
  });

  it("push 0 when bad pubkey", () => {
    const p1 = new PrivateKey(1n);
    const p2 = new PrivateKey(2n);
    const m = 2n;
    const n = 2n;

    const z = Buffer.alloc(32);
    const z2 = Buffer.alloc(32, 1);
    const stack = [
      encodeNum(0n),
      combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x01])),
      encodeNum(m),
      p2.point.sec().slice(1),
      p1.point.sec(),
      encodeNum(n),
    ];

    expect(opCheckMultiSig(stack, z2)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.alloc(0));
  });
});
