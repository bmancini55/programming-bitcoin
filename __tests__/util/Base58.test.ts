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
});
