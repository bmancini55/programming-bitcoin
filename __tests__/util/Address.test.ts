import { expect } from "chai";
import { Script } from "../../src/script/Script";
import { OpCode } from "../../src/script/OpCode";
import {
  p2shAddress,
  p2pkhAddress,
  decodeAddress,
} from "../../src/util/Address";
import { PrivateKey } from "../../src/ecc/PrivateKey";

describe("AddressUtils", () => {
  describe("p2pkhAddress", () => {
    it("mainnet", () => {
      const h160 = new PrivateKey(1n).point.hash160();
      const address = p2pkhAddress(h160, false);
      expect(address).to.equal("1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH");
    });

    it("testnet", () => {
      const h160 = new PrivateKey(1n).point.hash160();
      const address = p2pkhAddress(h160, true);
      expect(address).to.equal("mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r");
    });
  });

  describe("p2shAddress", () => {
    it("mainnet", () => {
      const h160 = new Script([OpCode.OP_1]).hash160();
      const address = p2shAddress(h160, false);
      expect(address).to.to.equal("3MaB7QVq3k4pQx3BhsvEADgzQonLSBwMdj");
    });

    it("testnet", () => {
      const h160 = new Script([OpCode.OP_1]).hash160();
      const address = p2shAddress(h160, true);
      expect(address).to.to.equal("2ND8PB9RrfCaAcjfjP1Y6nAgFd9zWHYX4DN");
    });
  });

  describe(".decodeAddress", () => {
    it("mainnet P2PKH", () => {
      const address = "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH";
      const actual = decodeAddress(address);
      expect(actual.hash.toString("hex")).to.equal("751e76e8199196d454941c45d1b3a323f1433bd6"); // prettier-ignore
      expect(actual.prefix).to.equal(BigInt(0x00));
    });

    it("testnet P2PKH", () => {
      const address = "mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r";
      const actual = decodeAddress(address);
      expect(actual.hash.toString("hex")).to.equal("751e76e8199196d454941c45d1b3a323f1433bd6"); // prettier-ignore
      expect(actual.prefix).to.equal(BigInt(0x6f));
    });

    it("mainnet P2SH", () => {
      const address = "3L2ckhFeDbHBvR61oH9kMHmQBhhAdH2byv";
      const actual = decodeAddress(address);
      expect(actual.hash.toString("hex")).to.equal("c9273dfe45b189084fdcc23eb026443b756ac770"); // prettier-ignore
      expect(actual.prefix).to.equal(BigInt(0x05));
    });

    it("testnet P2SH", () => {
      const address = "2NBappSBfq3nY8CiZUQmcyEkfQ3uLPU1EC2";
      const actual = decodeAddress(address);
      expect(actual.hash.toString("hex")).to.equal("c9273dfe45b189084fdcc23eb026443b756ac770"); // prettier-ignore
      expect(actual.prefix).to.equal(BigInt(0xc4));
    });
  });
});
