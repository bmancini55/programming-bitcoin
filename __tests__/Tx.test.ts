import { expect } from "chai";
import { TestStream } from "./TestStream";
import { Tx } from "../src/Tx";
import { TxIn } from "../src/TxIn";
import { TxOut } from "../src/TxOut";
import { p2pkhScript } from "../src/script/ScriptFactories";
import { PrivateKey } from "../src/ecc/PrivateKey";
import { decodeAddress } from "../src/util/Address";

describe("Tx", () => {
  describe(".parse()", () => {
    it("parses correctly", async () => {
      const raw = "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      expect(tx.txIns[1].prevTx).to.equal("d37f9e7282f81b7fd3af0fde8b462a1c28024f1d83cf13637ec18d03f4518feb"); // prettier-ignore
      expect(tx.txOuts[1].amount.toString()).to.equal("40000000");
    });
  });

  describe(".serialize()", () => {
    it("serializes correctly", async () => {
      const raw = "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const back = tx.serialize().toString("hex");
      expect(back).to.equal(raw);
    });
  });

  describe(".fees()", () => {
    it("should calculate fees", async () => {
      // txid ee51510d7bbabe28052038d1deb10c03ec74f06a79e21913c6fcf48d56217c87
      const raw = "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const fees = await tx.fees(false);
      expect(fees.toString()).to.equal("140500");
    }).timeout(10000);
  });

  describe(".sigHash()", () => {
    it("should generate the sigHash", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000001976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88acfeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac1943060001000000"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const hash = await tx.sigHash(0, false);
      expect(hash.toString("hex")).to.equal(
        "27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6"
      );
    });
  });

  describe(".verifyInput", () => {
    it("should verify an input", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const result = await tx.verifyInput(0, false);
      expect(result).to.equal(true);
    });
  });

  describe(".verify", () => {
    it("should verify the transaction", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const result = await tx.verify(false);
      expect(result).to.equal(true);
    });
  });

  describe(".signInput", () => {
    it("should sign the input", async () => {
      const in1 = new TxIn(
        "cf8597868cec794f9995fad1fb1066f06433332bc56c399c189460e74b7c9dfe",
        1n
      );

      const add1 = "mrz1DDxeqypyabBs8N9y3Hybe2LEz2cYBu";
      const out1 = new TxOut(900n, p2pkhScript(decodeAddress(add1).hash));

      const add2 = "myKLpz45CSfJzWbcXtammgHmNRZsnk2ocv";
      const out2 = new TxOut(11010000n, p2pkhScript(decodeAddress(add2).hash));

      const tx = new Tx(2n);
      tx.txIns.push(in1);
      tx.txOuts.push(out1);
      tx.txOuts.push(out2);

      const pk = new PrivateKey(BigInt("0x60226ca8fb12f6c8096011f36c5028f8b7850b63d495bc45ec3ca478a29b473d")); // prettier-ignore
      await tx.signInput(0, pk, true);

      const buf = tx.serialize();
      expect(buf.toString("hex")).to.equal(
        "0200000001fe9d7c4be76094189c396cc52b333364f06610fbd1fa95994f79ec8c869785cf010000006a473044022034903565f0c10373ad8884251c1af2b7f5ce029213f052ce10411c6ba090fac1022071f17d776536f800e5e24688ee2a341bbd05a776298287659005257e9948cf6f012102e577d441d501cace792c02bfe2cc15e59672199e2195770a61fd3288fc9f934fffffffff0284030000000000001976a9147dc70ca254627bebcb54c839984d32dad9092edf88acd0ffa700000000001976a914c34015187941b20ecda9378bb3cade86e80d2bfe88ac00000000"
      );
    });
  });
});
