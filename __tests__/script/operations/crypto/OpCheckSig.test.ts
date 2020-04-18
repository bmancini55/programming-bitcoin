import { expect } from "chai";
import { opCheckSig } from "../../../../src/script/operations/crypto/OpCheckSig";
import { testStackLen } from "../_OperationUtils";
import { S256Point } from "../../../../src/ecc/S256Point";
import { Signature } from "../../../../src/ecc/Signature";
import { combine } from "../../../../src/util/BufferUtil";

describe("Operation: opCheckSig", () => {
  testStackLen(opCheckSig, 2, Buffer.alloc(65));

  it("push 1 when sig verifies", () => {
    const point = new S256Point(
      BigInt("0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c"),
      BigInt("0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34"),
    ); // prettier-ignore
    const sec = point.sec(true);

    const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
    const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
    const sig = new Signature(r, s);
    const der = sig.der();

    const stack = [combine(der, Buffer.from([0x01])), sec];
    const z = Buffer.from("ec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60", "hex"); // prettier-ignore

    expect(opCheckSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([0x01]));
  });

  it("push 0 when invalid pubkey format", () => {
    const sec = Buffer.from([0x01]);

    const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
    const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
    const sig = new Signature(r, s);
    const der = sig.der();

    const stack = [combine(der, Buffer.from([0x01])), sec];
    const z = Buffer.from("ec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60", "hex"); // prettier-ignore

    expect(opCheckSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([]));
  });

  it("push 0 when invalid signature format", () => {
    const point = new S256Point(
      BigInt("0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c"),
      BigInt("0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34"),
    ); // prettier-ignore
    const sec = point.sec(true);

    const der = Buffer.from([0x01]);

    const stack = [combine(der, Buffer.from([0x01])), sec];
    const z = Buffer.from("ec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60", "hex"); // prettier-ignore

    expect(opCheckSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([]));
  });

  it("push 0 when invalid signature", () => {
    const point = new S256Point(
      BigInt("0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c"),
      BigInt("0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34"),
    ); // prettier-ignore
    const sec = point.sec(true);

    const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
    const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
    const sig = new Signature(r, s);
    const der = sig.der();

    const stack = [combine(der, Buffer.from([0x01])), sec];
    const z = Buffer.from("00208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60", "hex"); // prettier-ignore

    expect(opCheckSig(stack, z)).to.equal(true);
    expect(stack[0]).to.deep.equal(Buffer.from([]));
  });
});
