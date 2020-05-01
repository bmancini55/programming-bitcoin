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

    it("should calculate the root", () => {
      const hashes = [
        "9745f7173ef14ee4155722d1cbf13304339fd00d900b759c6f9d58579b5765fb",
        "5573c8ede34936c29cdfdfe743f7f5fdfbd4f54ba0705259e62f39917065cb9b",
        "82a02ecbb6623b4274dfcab82b336dc017a27136e08521091e443e62582e8f05",
        "507ccae5ed9b340363a0e6d765af148be9cb1c8766ccc922f83e4ae681658308",
        "a7a4aec28e7162e1e9ef33dfa30f0bc0526e6cf4b11a576f6c5de58593898330",
        "bb6267664bd833fd9fc82582853ab144fece26b7a8a5bf328f8a059445b59add",
        "ea6d7ac1ee77fbacee58fc717b990c4fcccf1b19af43103c090f601677fd8836",
        "457743861de496c429912558a106b810b0507975a49773228aa788df40730d41",
        "7688029288efc9e9a0011c960a6ed9e5466581abf3e3a6c26ee317461add619a",
        "b1ae7f15836cb2286cdd4e2c37bf9bb7da0a2846d06867a429f654b2e7f383c9",
        "9b74f89fa3f93e71ff2c241f32945d877281a6a50a6bf94adac002980aafe5ab",
        "b3a92b5b255019bdaf754875633c2de9fec2ab03e6b8ce669d07cb5b18804638",
        "b5c0b915312b9bdaedd2b86aa2d0f8feffc73a2d37668fd9010179261e25e263",
        "c9d52c5cb1e557b92c84c52e7c4bfbce859408bedffc8a5560fd6e35e10b8800",
        "c555bc5fc3bc096df0a0c9532f07640bfb76bfe4fc1ace214b8b228a1297a4c2",
        "f9dbfafc3af3400954975da24eb325e326960a25b87fffe23eef3e7ed2fb610e",
        "8e694f5092f6a644ab587ca445f9e949e4f5991d3c3c72bd4574a7c9896a2402",
        "9cc887977168f430f4f896dfc6fc7379834733ce938abe7cd8a1a668d1ea1841",
      ].map(p => Buffer.from(p, "hex").reverse());

      const expected =
        "f2710c8f3652ec6bfe79769458ae4be8117cad46964ce9dab9ce570bcb2ff9b0";

      expect(merkle.merkleRoot(hashes).reverse().toString("hex")).to.equal(
        expected
      );
    });
  });
});
