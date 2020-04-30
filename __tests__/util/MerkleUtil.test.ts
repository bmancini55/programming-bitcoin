import { expect } from "chai";
import * as merkle from "../../src/util/MerkleUtil";

describe("MerkleUtil", () => {
  describe(".merkleParent()", () => {
    it("calculates the parent", () => {
      const hash1 = Buffer.from(
        "c117ea8ec828342f4dfb0ad6bd140e03a50720ece40169ee38bdc15d9eb64cf5",
        "hex"
      );
      const hash2 = Buffer.from(
        "c131474164b412e3406696da1ee20ab0fc9bf41c8f05fa8ceea7a08d672d7cc5",
        "hex"
      );
      const expected =
        "8b30c5ba100f6f2e5ad1e2a742e5020491240f8eb514fe97c713c31718ad7ecd";
      expect(merkle.merkleParent(hash1, hash2).toString("hex")).to.equal(
        expected
      );
    });
  });

  describe(".merkleParentLevel", () => {
    it("even", () => {
      const hashes = [
        "c117ea8ec828342f4dfb0ad6bd140e03a50720ece40169ee38bdc15d9eb64cf5",
        "c131474164b412e3406696da1ee20ab0fc9bf41c8f05fa8ceea7a08d672d7cc5",
        "f391da6ecfeed1814efae39e7fcb3838ae0b02c02ae7d0a5848a66947c0727b0",
        "3d238a92a94532b946c90e19c49351c763696cff3db400485b813aecb8a13181",
      ].map(h => Buffer.from(h, "hex"));

      const results = merkle.merkleParentLevel(hashes);

      const expected = [
        "8b30c5ba100f6f2e5ad1e2a742e5020491240f8eb514fe97c713c31718ad7ecd",
        "7f4e6f9e224e20fda0ae4c44114237f97cd35aca38d83081c9bfd41feb907800",
      ];

      expect(results.map(p => p.toString("hex"))).to.deep.equal(expected);
    });

    it("odd", () => {
      const hashes = [
        "c117ea8ec828342f4dfb0ad6bd140e03a50720ece40169ee38bdc15d9eb64cf5",
        "c131474164b412e3406696da1ee20ab0fc9bf41c8f05fa8ceea7a08d672d7cc5",
        "f391da6ecfeed1814efae39e7fcb3838ae0b02c02ae7d0a5848a66947c0727b0",
        "3d238a92a94532b946c90e19c49351c763696cff3db400485b813aecb8a13181",
        "10092f2633be5f3ce349bf9ddbde36caa3dd10dfa0ec8106bce23acbff637dae",
      ].map(h => Buffer.from(h, "hex"));

      const results = merkle.merkleParentLevel(hashes);

      const expected = [
        "8b30c5ba100f6f2e5ad1e2a742e5020491240f8eb514fe97c713c31718ad7ecd",
        "7f4e6f9e224e20fda0ae4c44114237f97cd35aca38d83081c9bfd41feb907800",
        "3ecf6115380c77e8aae56660f5634982ee897351ba906a6837d15ebc3a225df0",
      ];

      expect(results.map(p => p.toString("hex"))).to.deep.equal(expected);
    });
  });

  describe(".merkleRoot()", () => {
    it("should calculates the root", () => {
      const hashes = [
        "c117ea8ec828342f4dfb0ad6bd140e03a50720ece40169ee38bdc15d9eb64cf5",
        "c131474164b412e3406696da1ee20ab0fc9bf41c8f05fa8ceea7a08d672d7cc5",
        "f391da6ecfeed1814efae39e7fcb3838ae0b02c02ae7d0a5848a66947c0727b0",
        "3d238a92a94532b946c90e19c49351c763696cff3db400485b813aecb8a13181",
        "10092f2633be5f3ce349bf9ddbde36caa3dd10dfa0ec8106bce23acbff637dae",
        "7d37b3d54fa6a64869084bfd2e831309118b9e833610e6228adacdbd1b4ba161",
        "8118a77e542892fe15ae3fc771a4abfd2f5d5d5997544c3487ac36b5c85170fc",
        "dff6879848c2c9b62fe652720b8df5272093acfaa45a43cdb3696fe2466a3877",
        "b825c0745f46ac58f7d3759e6dc535a1fec7820377f24d4c2c6ad2cc55c0cb59",
        "95513952a04bd8992721e9b7e2937f1c04ba31e0469fbe615a78197f68f52b7c",
        "2e6d722e5e4dbdf2447ddecc9f7dabb8e299bae921c99ad5b0184cd9eb8e5908",
        "b13a750047bc0bdceb2473e5fe488c2596d7a7124b4e716fdd29b046ef99bbf0",
      ].map(p => Buffer.from(p, "hex"));

      const expected =
        "acbcab8bcc1af95d8d563b77d24c3d19b18f1486383d75a5085c4e86c86beed6";

      expect(merkle.merkleRoot(hashes).toString("hex")).to.equal(expected);
    });
  });
});