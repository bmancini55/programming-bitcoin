import { expect } from "chai";
import { PrivateKey } from "../../src/ecc/PrivateKey";
import {
  p2pkhScript,
  p2msScript,
  p2shScript,
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

    it("evaluates", () => {
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

      const z = Buffer.alloc(32);
      const scriptSig = new Script([
        OpCode.OP_0,
        combine(p1.sign(bigFromBuf(z)).der(), Buffer.from([0x1])),
        combine(p2.sign(bigFromBuf(z)).der(), Buffer.from([0x1])),
      ]);

      const script = scriptSig.add(scriptPubKey);
      expect(script.evaluate(z)).to.equal(true);
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
});
