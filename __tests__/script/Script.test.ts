import { expect } from "chai";
import { Script } from "../../src/script/Script";
import { TestStream } from "../TestStream";

describe("Script", () => {
  describe(".parse()", () => {
    it("parses", async () => {
      const data = Buffer.from("6a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937", "hex"); // prettier-ignore
      const stream = new TestStream(data);
      const script = await Script.parse(stream);
      expect((script.parts[0] as Buffer).toString("hex")).to.equal(
        "304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a71601"
      );
      expect((script.parts[1] as Buffer).toString("hex")).to.equal(
        "035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937"
      );
    });
  });

  describe(".serialize()", () => {
    it("serialize", () => {
      const script = new Script();
      script.parts.push(
        Buffer.from(
          "304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a71601",
          "hex"
        )
      );
      script.parts.push(
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
});
