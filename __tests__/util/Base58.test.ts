import { expect } from "chai";
import * as base58 from "../../src/util/Base58";

describe("Base58", () => {
  describe(".encodeBase58", () => {
    const tests: [Buffer, string][] = [
      [
        Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"),
        "9MA8fRQrT4u8Zj8ZRd6MAiiyaxb2Y1CMpvVkHQu5hVM6"
      ],
      [
        Buffer.from("eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c", "hex"),
        "4fE3H2E6XMp4SsxtwinF7w9a34ooUrwWe4WsW1458Pd"
      ],
      [
        Buffer.from("c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6", "hex"),
        "EQJsjkd6JaGwxrjEhfeqPenqHwrBmPQZjJGNSCHBkcF7"
      ]
    ]; // prettier-ignore

    for (const test of tests) {
      it(`${test[0].toString("hex")}`, () => {
        expect(base58.encodeBase58(test[0])).to.equal(test[1]);
      });
    }
  });

  describe(".encodeBase58Check", () => {
    const tests: [Buffer, string][] = [
      [
        Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"),
        "wdA2ffYs5cudrdkhFm5Ym94AuLvavacapuDBL2CAcvqYPkcvi"
      ],
      [
        Buffer.from("eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c", "hex"),
        "Qwj1mwXNifQmo5VV2s587usAy4QRUviQsBxoe4EJXyWz4GBs"
      ],
      [
        Buffer.from("c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6", "hex"),
        "2WhRyzK3iKFveq4hvQ3VR9uau26t6qZCMhADPAVMeMR6VraBbX"
      ]
    ]; // prettier-ignore

    for (const test of tests) {
      it(`${test[0].toString("hex")}`, () => {
        expect(base58.encodeBase58Check(test[0])).to.equal(test[1]);
      });
    }
  });

  describe(".decodeBase58", () => {
    const tests: [string, Buffer][] = [
      [
        "9MA8fRQrT4u8Zj8ZRd6MAiiyaxb2Y1CMpvVkHQu5hVM6",
        Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"),
      ],
      [
        "4fE3H2E6XMp4SsxtwinF7w9a34ooUrwWe4WsW1458Pd",
        Buffer.from("eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c", "hex"),
      ],
      [
        "EQJsjkd6JaGwxrjEhfeqPenqHwrBmPQZjJGNSCHBkcF7",
        Buffer.from("c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6", "hex"),
      ]
    ]; // prettier-ignore

    for (const test of tests) {
      it(`${test[0]}`, () => {
        expect(base58.decodeBase58(test[0])).to.deep.equal(test[1]);
      });
    }
  });

  describe(".decodeBase58Check", () => {
    const tests: [string, Buffer][] = [
      [
        "wdA2ffYs5cudrdkhFm5Ym94AuLvavacapuDBL2CAcvqYPkcvi",
        Buffer.from("7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d", "hex"),
      ],
      [
        "Qwj1mwXNifQmo5VV2s587usAy4QRUviQsBxoe4EJXyWz4GBs",
        Buffer.from("eff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c", "hex"),
      ],
      [
        "2WhRyzK3iKFveq4hvQ3VR9uau26t6qZCMhADPAVMeMR6VraBbX",
        Buffer.from("c7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6", "hex"),
      ]
    ]; // prettier-ignore

    for (const test of tests) {
      it(`${test[0]}`, () => {
        expect(base58.decodeBase58Check(test[0])).to.deep.equal(test[1]);
      });
    }
  });

  describe(".decodeAddress", () => {
    it("should decode an address", () => {
      const address = "mrz1DDxeqypyabBs8N9y3Hybe2LEz2cYBu";

      const actual = base58.decodeAddress(address);
      expect(actual.hash.toString("hex")).to.equal(
        "7dc70ca254627bebcb54c839984d32dad9092edf"
      );
      expect(actual.prefix).to.equal(111n);
    });
  });
});
