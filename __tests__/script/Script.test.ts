import { expect } from "chai";
import { Script } from "../../src/script/Script";
import { TestStream } from "../TestStream";
import { OpCode } from "../../src/script/OpCode";

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
    it("evaluates", () => {
      const z = Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"); // prettier-ignore

      const scriptPubKey = new Script([
        Buffer.from("04887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34", "hex"),
        OpCode.OP_CHECKSIG,
      ]); // prettier-ignore

      const scriptSig = new Script([
        Buffer.from("3045022000eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c022100c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab601", "hex")
      ]); // prettier-ignore

      const combined = scriptSig.add(scriptPubKey);
      expect(combined.evaluate(z)).to.equal(true);
    });
  });
});
