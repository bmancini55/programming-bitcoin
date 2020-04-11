import { expect } from "chai";
import { PrivateKey } from "../../src/ecc/PrivateKey";

describe("PrivateKey", () => {
  describe(".wif()", () => {
    it("5003 (compressed, testnet)", () => {
      const pk = new PrivateKey(5003n);
      expect(pk.wif(true, true)).to.equal("cMahea7zqjxrtgAbB7LSGbcQUr1uX1ojuat9jZodMN8rFTv2sfUK"); // prettier-ignore
    });

    it("2021^5 (uncompressed, testnet)", () => {
      const pk = new PrivateKey(2021n ** 5n);
      expect(pk.wif(false, true)).to.equal("91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjpWAxgzczjbCwxic"); // prettier-ignore
    });

    it("0x54321deadbeef (compressed, mainnet)", () => {
      const pk = new PrivateKey(BigInt("0x54321deadbeef"));
      expect(pk.wif(true, false)).to.equal("KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgiuQJv1h8Ytr2S53a"); // prettier-ignore
    });
  });
});
