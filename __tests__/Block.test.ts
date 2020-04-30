import { expect } from "chai";
import { Block } from "../src/Block";
import { bufToStream } from "../src/util/BufferUtil";

describe("Block", () => {
  describe(".parse()", () => {
    it("parse headers", () => {
      const buf = Buffer.from(
        "020000208ec39428b17323fa0ddec8e887b4a7\
c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
3157f961db38fd8b25be1e77a759e93c0118a4ffd71d",
        "hex"
      );
      const block = Block.parse(bufToStream(buf));
      expect(block.version.toString()).to.equal("536870914");
      expect(block.prevBlock.toString("hex")).to.equal(
        "000000000000000000fd0c220a0a8c3bc5a7b487e8c8de0dfa2373b12894c38e"
      );
      expect(block.merkleRoot.toString("hex")).to.equal(
        "be258bfd38db61f957315c3f9e9c5e15216857398d50402d5089a8e0fc50075b"
      );
      expect(block.timestamp.toString()).to.equal("1504147230");
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

  describe(".validateMerkleRoot", () => {
    it("validates", () => {
      // 0000000000000451fa80fcdb243b84c35eaae215a85a8faa880559e8239e6f20
      const block = new Block(
        BigInt(0x20000000),
        Buffer.from(
          "000000000000010466f487e7d9c7557fda40b79852b00bee762505f5175f4cd0",
          "hex"
        ),
        Buffer.from(
          "4297fb95a0168b959d1469410c7527da5d6243d99699e7d041b7f3916ba93301",
          "hex"
        ),
        BigInt(1504242100),
        Buffer.from("1a06ca16", "hex"),
        Buffer.from("d8927c4a", "hex")
      );
      block.txHashes = [
        "42f6f52f17620653dcc909e58bb352e0bd4bd1381e2955d19c00959a22122b2e",
        "94c3af34b9667bf787e1c6a0a009201589755d01d02fe2877cc69b929d2418d4",
        "959428d7c48113cb9149d0566bde3d46e98cf028053c522b8fa8f735241aa953",
        "a9f27b99d5d108dede755710d4a1ffa2c74af70b4ca71726fa57d68454e609a2",
        "62af110031e29de1efcad103b3ad4bec7bdcf6cb9c9f4afdd586981795516577",
        "766900590ece194667e9da2984018057512887110bf54fe0aa800157aec796ba",
        "e8270fb475763bc8d855cfe45ed98060988c1bdcad2ffc8364f783c98999a208",
        "921b8cfd3e14bf41f028f0a3aa88c813d5039a2b1bceb12208535b0b43a5d09e",
        "15535864799652347cec66cba473f6d8291541238e58b2e03b046bc53cfe1321",
        "1c8af7c502971e67096456eac9cd5407aacf62190fc54188995666a30faf99f0",
        "3311f8acc57e8a3e9b68e2945fb4f53c07b0fa4668a7e5cda6255c21558c774d",
      ];
      expect(block.validateMerkleRoot()).to.equal(true);
    });
  });
});
