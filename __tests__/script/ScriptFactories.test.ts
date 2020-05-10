import { expect } from "chai";
import { PrivateKey } from "../../src/ecc/PrivateKey";
import {
  p2pkhScript,
  p2msScript,
  p2shScript,
  p2wpkhScript,
  p2wpkhSig,
  p2wpkhWitness,
} from "../../src/script/ScriptFactories";
import { bigFromBuf } from "../../src/util/BigIntUtil";
import { Script } from "../../src/script/Script";
import { combine } from "../../src/util/BufferUtil";
import { OpCode } from "../../src/script/OpCode";
import { hash160 } from "../../src/util/Hash160";

describe("ScriptFactories", () => {
  describe("p2pkhScript", () => {
    it("serializes", () => {
      const h160 = Buffer.from(
        "d52ad7ca9b3d096a38e752c2018e6fbc40cdf26f",
        "hex"
      );
      const result = p2pkhScript(h160);
      expect(result.serialize().toString("hex")).to.equal(
        "1976a914d52ad7ca9b3d096a38e752c2018e6fbc40cdf26f88ac"
      );
    });
  });

  describe("p2msScript", () => {
    it("serializes", () => {
      const p1 = new PrivateKey(1n);
      const p2 = new PrivateKey(2n);
      const m = 2n;
      const n = 2n;
      const scriptPubKey = p2msScript(
        m,
        n,
        p1.point.sec(true),
        p2.point.sec(true)
      );

      expect(scriptPubKey.serialize().toString("hex")).to.equal(
        "4752210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817982102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee552ae"
      );
    });
  });

  describe(".p2shScript()", () => {
    it("serializes", () => {
      const h160 = hash160(Buffer.from("test"));
      const script = p2shScript(h160);
      expect(script.serialize().toString("hex")).to.equal(
        "17a914cebaa98c19807134434d107b0d3e5692a516ea6687"
      );
    });
  });

  describe(".p2wpkhScript()", () => {
    it("serialzies", () => {
      const h160 = hash160(Buffer.from("test"));
      const script = p2wpkhScript(h160);
      expect(script.serialize().toString("hex")).to.equal(
        "160014cebaa98c19807134434d107b0d3e5692a516ea66"
      );
    });
  });

  describe(".p2wpkhSig()", () => {
    it("serializes", () => {
      const script = p2wpkhSig();
      expect(script.serialize().toString("hex")).to.equal("00");
    });
  });

  describe(".p2wpkhWitness()", () => {
    it("serializes", () => {
      const p = new PrivateKey(1n);
      const z = Buffer.alloc(32);
      const sig = p.sign(bigFromBuf(z));
      const script = p2wpkhWitness(sig, p.point);
      expect((script[0] as Buffer).toString("hex")).to.equal(
        "3044022054c5a5a495fd7fe1c4ffe650760a6993a8642d04d943c3d9b21955f8011d634c0220048ddb960ee0f757602a526486d74f84cebabd14ee5f6aa9da1b2e102f62e7b001"
      );
      expect((script[1] as Buffer).toString("hex")).to.equal(
        "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
      );
    });
  });
});
