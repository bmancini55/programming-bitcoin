import { expect } from "chai";
import { Script } from "../../src/script/Script";
import { TestStream } from "../TestStream";
import { OpCode } from "../../src/script/OpCode";
import { PrivateKey } from "../../src/ecc/PrivateKey";
import {
  p2msLock,
  p2pkhLock,
  p2shLock,
  p2pkhUnlock,
  p2msUnlock,
  p2shUnlock,
  p2wpkhLock,
  p2wpkhWitness,
  p2wpkhUnlock,
} from "../../src/script/ScriptFactories";
import { combine, combineLE } from "../../src/util/BufferUtil";
import { bigFromBuf } from "../../src/util/BigIntUtil";

describe("Script", () => {
  describe(".parse()", () => {
    it("parses", async () => {
      const data = Buffer.from("6a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937", "hex"); // prettier-ignore
      const stream = new TestStream(data);
      const script = await Script.parse(stream);
      expect((script.cmds[0] as Buffer).toString("hex")).to.equal(
        "304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a71601"
      );
      expect((script.cmds[1] as Buffer).toString("hex")).to.equal(
        "035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937"
      );
    });
  });

  describe(".serialize()", () => {
    it("serialize", () => {
      const script = new Script();
      script.cmds.push(
        Buffer.from(
          "304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a71601",
          "hex"
        )
      );
      script.cmds.push(
        Buffer.from(
          "035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937",
          "hex"
        )
      );
      expect(script.serialize().toString("hex")).to.equal(
        "6a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937"
      );
    });
  });

  describe(".evaluate()", () => {
    it("evaluates p2pk", async () => {
      const z = Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"); // prettier-ignore

      const scriptPubKey = new Script([
          Buffer.from("04887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34", "hex"),
          OpCode.OP_CHECKSIG,
        ]); // prettier-ignore

      const scriptSig = new Script([
          Buffer.from("3045022000eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c022100c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab601", "hex")
        ]); // prettier-ignore

      const combined = scriptSig.add(scriptPubKey);
      const result = combined.evaluate(z);
      expect(result).to.equal(true);
    });

    it("evaluates p2pkh", async () => {
      const z = Buffer.alloc(32);
      const p1 = new PrivateKey(1n);
      const sig = p1.sign(bigFromBuf(z));
      const scriptPubKey = p2pkhLock(p1.point.hash160(true));
      const scriptSig = p2pkhUnlock(sig.der(), p1.point.sec(true));
      const script = scriptSig.add(scriptPubKey);
      const result = script.evaluate(z);
      expect(result).to.equal(true);
    });

    it("evaluates p2ms", async () => {
      const p1 = new PrivateKey(1n);
      const p2 = new PrivateKey(2n);
      const m = 2n;
      const n = 2n;
      const scriptPubKey = p2msLock(
        m,
        n,
        p1.point.sec(true),
        p2.point.sec(true)
      );

      const z = Buffer.alloc(32);
      const sig1 = p1.sign(bigFromBuf(z));
      const sig2 = p2.sign(bigFromBuf(z));
      const scriptSig = p2msUnlock(sig1.der(), sig2.der());

      const script = scriptSig.add(scriptPubKey);
      const result = script.evaluate(z);
      expect(result).to.equal(true);
    });

    it("evaluates ms p2sh", async () => {
      const p1 = new PrivateKey(1n);
      const p2 = new PrivateKey(2n);
      const m = 1n;
      const n = 2n;
      const redeemScript = p2msLock(
        m,
        n,
        p1.point.sec(true),
        p2.point.sec(true)
      );

      const z = Buffer.alloc(32);
      const sig2 = p2.sign(bigFromBuf(z));
      const scriptSig = p2shUnlock(
        redeemScript,
        ...p2msUnlock(sig2.der()).cmds
      );

      const script = scriptSig.add(scriptSig);
      const result = script.evaluate(z);
      expect(result).to.equal(true);
    });

    it("evaluates arbitrary p2sh", async () => {
      const p1 = new PrivateKey(1n);
      const redeemScript = new Script([
        OpCode.OP_DUP,
        OpCode.OP_ADD,
        OpCode.OP_4,
        OpCode.OP_EQUAL,
      ]);
      const scriptPubKey = p2shLock(redeemScript.hash160());
      const scriptSig = p2shUnlock(redeemScript, OpCode.OP_2);

      const script = scriptSig.add(scriptPubKey);
      const result = script.evaluate(Buffer.alloc(0));
      expect(result).to.equal(true);
    });

    it("evaluates p2wpkh", async () => {
      const p = new PrivateKey(1n);
      const z = Buffer.alloc(32);
      const sig = p.sign(bigFromBuf(z));
      const witness = p2wpkhWitness(sig, p.point);

      const scriptPubKey = p2wpkhLock(p.point.hash160(true));
      const scriptSig = p2wpkhUnlock();

      const script = scriptSig.add(scriptPubKey);
      const result = script.evaluate(z, witness);
      expect(result).to.equal(true);
    });

    it("evaluates p2sh-p2wpkh", async () => {
      const p = new PrivateKey(1n);
      const z = Buffer.alloc(32);
      const sig = p.sign(bigFromBuf(z));
      const witness = p2wpkhWitness(sig, p.point);
      const redeemScript = p2wpkhLock(p.point.hash160(true));

      const scriptPubKey = p2shLock(redeemScript.hash160());
      const scriptSig = p2shUnlock(redeemScript);

      const script = scriptSig.add(scriptPubKey);
      const result = script.evaluate(z, witness);
      expect(result).to.equal(true);
    });
  });

  describe(".isP2shScriptPubKey", () => {
    it("false when not p2sh script pub key", () => {
      const p1 = new PrivateKey(1n);
      const script = p2pkhLock(p1.point.hash160());
      expect(script.isP2shScriptPubKey()).to.equal(false);
    });

    it("true when p2sh script pub key", () => {
      const script = new Script([OpCode.OP_2]);
      const scriptPubKey = p2shLock(script.hash160());
      expect(scriptPubKey.isP2shScriptPubKey()).to.equal(true);
    });
  });

  describe(".isP2pkhScriptPubkey", () => {
    it("false when not p2pkh script pub key", () => {
      const p1 = new PrivateKey(1n);
      const script = new Script([OpCode.OP_2]);
      const scriptPubKey = p2shLock(script.hash160());
      expect(scriptPubKey.isP2pkhScriptPubKey()).to.equal(false);
    });

    it("true when p2pkh script pub key", () => {
      const p1 = new PrivateKey(1n);
      const script = p2pkhLock(p1.point.hash160());
      expect(script.isP2pkhScriptPubKey()).to.equal(true);
    });
  });

  describe(".isP2wpkhScriptPubKey", () => {
    it("false when not p2wpkh script pub key", () => {
      const p1 = new PrivateKey(1n);
      const script = p2pkhLock(p1.point.hash160());
      expect(script.isP2wpkhScriptPubKey()).to.equal(false);
    });

    it("true when p2wpkh script pub key", () => {
      const p1 = new PrivateKey(1n);
      const script = p2wpkhLock(p1.point.hash160());
      expect(script.isP2wpkhScriptPubKey()).to.equal(true);
    });
  });

  describe(".address()", () => {
    it("p2pkh", () => {
      const p1 = new PrivateKey(1n);
      const script = p2pkhLock(p1.point.hash160());
      expect(script.address(true)).to.equal(
        "mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r"
      );
    });

    it("p2sh", () => {
      const p1 = new PrivateKey(1n);
      const p2pkh = p2pkhLock(p1.point.hash160());
      const p2sh = p2shLock(p2pkh.hash160());
      expect(p2sh.address(true)).to.equal(
        "2MxS5Dm2PNheCL3Cw6EZdrVSmsqMZKgetqS"
      );
    });
  });
});
