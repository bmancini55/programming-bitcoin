import { expect } from "chai";
import { Block } from "../src/Block";
import { TestStream } from "./TestStream";
import { bufToStream } from "../src/util/BufferUtil";

describe("Block", () => {
  describe(".parse()", () => {
    it("parse headers", async () => {
      const raw =
        "020000208ec39428b17323fa0ddec8e887b4a7\
c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
3157f961db38fd8b25be1e77a759e93c0118a4ffd71d";
      const buf = Buffer.from(raw, "hex");
      const stream = bufToStream(buf);
      const block = await Block.parse(stream);
      expect(block.version).to.equal(536870914n);
      expect(block.prevBlock.toString("hex")).to.equal(
        "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e"
      );
      expect(block.merkleRoot.toString("hex")).to.equal(
        "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b"
      );
      expect(block.timestamp).to.equal(1504147230n);
      expect(block.bits).to.deep.equal(Buffer.from("18013ce9", "hex"));
      expect(block.nonce).to.deep.equal(Buffer.from("1dd7ffa4", "hex"));
    });
  });

  describe(".serialize()", () => {
    it("should serialize", () => {
      const block = new Block(
        536870914n,
        Buffer.from("000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e", "hex"),
        Buffer.from("be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b", "hex"),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("1dd7ffa4", "hex"),
      ); // prettier-ignore

      const result = block.serialize();
      expect(result.toString("hex")).to.equal(
        "020000208ec39428b17323fa0ddec8e887b4a7\
c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
3157f961db38fd8b25be1e77a759e93c0118a4ffd71d"
      );
    });
  });

  describe(".hash()", () => {
    it("should return LE hash", () => {
      const block = new Block(
        536870914n,
        Buffer.from("000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e", "hex"),
        Buffer.from("be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b", "hex"),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("1dd7ffa4", "hex"),
      ); // prettier-ignore

      const result = block.hash();
      expect(result.toString("hex")).to.equal(
        "0000000000000000007e9e4c586439b0cdbe13b1370bdd9435d76a644d047523"
      );
    });
  });

  describe(".bip9()", () => {
    it("true", () => {
      const block = new Block(
        536870914n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip9()).to.equal(true);
    });

    it("false", () => {
      const block = new Block(
        1n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip9()).to.equal(false);
    });
  });

  describe(".bip91()", () => {
    it("true", () => {
      const block = new Block(
        (1n << 29n) + (1n << 4n),
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip91()).to.equal(true);
    });

    it("false", () => {
      const block = new Block(
        (1n << 29n) + 1n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip91()).to.equal(false);
    });
  });

  describe(".bip91()", () => {
    it("true", () => {
      const block = new Block(
        (1n << 29n) + (1n << 1n),
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip141()).to.equal(true);
    });

    it("false", () => {
      const block = new Block(
        (1n << 29n) + 1n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(4),
        Buffer.alloc(4)
      );
      expect(block.bip141()).to.equal(false);
    });
  });

  describe(".target()", () => {
    it("calculates target", () => {
      const block = new Block(
        536870914n,
        Buffer.from(
          "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e",
          "hex"
        ),
        Buffer.from(
          "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b",
          "hex"
        ),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("1dd7ffa4", "hex")
      );

      const target = block.target();
      expect(target.toString(16).padStart(64, "0")).to.equal(
        "0000000000000000013ce9000000000000000000000000000000000000000000"
      );
    });
  });

  describe(".difficulty()", () => {
    it("calculates difficulty", () => {
      const block = new Block(
        536870914n,
        Buffer.from(
          "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e",
          "hex"
        ),
        Buffer.from(
          "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b",
          "hex"
        ),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("1dd7ffa4", "hex")
      );
      const diff = block.difficulty();
      expect(diff).to.equal(888171856257n);
    });
  });

  describe(".checkProofOfWork()", () => {
    it("true when valid", () => {
      const block = new Block(
        536870914n,
        Buffer.from(
          "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e",
          "hex"
        ),
        Buffer.from(
          "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b",
          "hex"
        ),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("1dd7ffa4", "hex")
      );
      expect(block.checkProofOfWork()).to.equal(true);
    });

    it("false when invalid", () => {
      const block = new Block(
        536870914n,
        Buffer.from(
          "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e",
          "hex"
        ),
        Buffer.from(
          "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b",
          "hex"
        ),
        1504147230n,
        Buffer.from("18013ce9", "hex"),
        Buffer.from("00000000", "hex")
      );
      expect(block.checkProofOfWork()).to.equal(false);
    });
  });
});
