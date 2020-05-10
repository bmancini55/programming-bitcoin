import { expect } from "chai";
import { TestStream } from "./TestStream";
import { Tx } from "../src/Tx";
import { TxIn } from "../src/TxIn";
import { TxOut } from "../src/TxOut";
import {
  p2pkhScript,
  p2wpkhScript,
  p2shScript,
  p2wpkhWitness,
} from "../src/script/ScriptFactories";
import { PrivateKey } from "../src/ecc/PrivateKey";
import { decodeAddress } from "../src/util/Address";
import { Script } from "../src/script/Script";
import { bufToStream, streamFromHex } from "../src/util/BufferUtil";
import { bigFromBufLE } from "../src/util/BigIntUtil";
import { hash160 } from "../src/util/Hash160";

// https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#native-p2wpkh
const p2wpkhBuf = Buffer.from(
  "01000000000102fff7f7881a8099afa6940d42d1e7f6362bec38171ea3edf433541db4e4ad969f00000000494830450221008b9d1dc26ba6a9cb62127b02742fa9d754cd3bebf337f7a55d114c8e5cdd30be022040529b194ba3f9281a99f2b1c0a19c0489bc22ede944ccf4ecbab4cc618ef3ed01eeffffffef51e1b804cc89d182d279655c3aa89e815b1b309fe287d9b2b55d57b90ec68a0100000000ffffffff02202cb206000000001976a9148280b37df378db99f66f85c95a783a76ac7a6d5988ac9093510d000000001976a9143bde42dbee7e4dbe6a21b2d50ce2f0167faa815988ac000247304402203609e17b84f6a7d30c80bfa610b5b4542f32a8a0d5447a12fb1366d7f01cc44a0220573a954c4518331561406f90300e8f3358f51928d43c212a8caed02de67eebee0121025476c2e83188368da1ff3e292e7acafcdb3566bb0ad253f62fc70f07aeee635711000000",
  "hex"
);

// https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki#p2sh-p2wpkh
const p2sh_p2wpkh = Buffer.from(
  "01000000000101db6b1b20aa0fd7b23880be2ecbd4a98130974cf4748fb66092ac4d3ceb1a5477010000001716001479091972186c449eb1ded22b78e40d009bdf0089feffffff02b8b4eb0b000000001976a914a457b684d7f0d539a46a45bbc043f35b59d0d96388ac0008af2f000000001976a914fd270b1ee6abcaea97fea7ad0402e8bd8ad6d77c88ac02473044022047ac8e878352d3ebbde1c94ce3a10d057c24175747116f8288e5d794d12d482f0220217f36a485cae903c713331d877c1f64677e3622ad4010726870540656fe9dcb012103ad1d8e89212f0b92c74d23bb710c00662ad1470198ac48c43f7d6f93a2a2687392040000",
  "hex"
);

describe("Tx", () => {
  describe(".parse()", () => {
    describe("legacy", () => {
      let tx: Tx;
      before(() => {
        const buf = Buffer.from(
          "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600",
          "hex"
        );
        tx = Tx.parse(bufToStream(buf));
      });

      it("has txin", () => {
        expect(tx.txIns[1].prevTx).to.equal("d37f9e7282f81b7fd3af0fde8b462a1c28024f1d83cf13637ec18d03f4518feb"); // prettier-ignore
      });

      it("has txout", () => {
        expect(tx.txOuts[1].amount.toString()).to.equal("40000000");
      });

      it("not segwit", () => {
        expect(tx.segwit).to.equal(false);
      });
    });

    describe("segwit", () => {
      let tx: Tx;
      before(() => {
        const buf = Buffer.from(
          "01000000000102de5171fa8408be141b5b76eee5bc9473f7dc88608836538e6ea188767a0ff81c0000000000ffffffff91fe1e2b72b91a8a006133e43e200a76d15235e6649c80ec08b8c950a7fa58620200000000ffffffff03a83a00000000000016001489a8f6e17e9d35eac2f22fcd2ec81e20c0836e23a83a000000000000160014d72602e36124a8dfadf006d661b7758cd185db14021f030000000000160014f5c89211f860135b4ffda432a7b5e0c37cacc5f80247304402206ef62a229dd1a7fe9cb1662edacfae7781c613b2b2a43053856e574c04e0924f02206eb551ea1b25cecaa2bca52de7328b3ae0a6546c27c0e57af52e89553b3372f0012103d5d0477f9f41dff094a80aa19e92a69a622bb14c3c1918dc7a77a48d5d6af8b30247304402207fd85667b94f823c0c64c3b8d2db478b3f88f2c26812ab845183124406cb19fe022074c695f8a3bd4f0b2ea16931242fe711ff3a12d65a385562f96e74e2178a47fd012103bedaa9af254733ff24b3fadd0688368a2f2b5c8221df35abc3552d88feda992000000000",
          "hex"
        );
        tx = Tx.parse(bufToStream(buf), true);
      });

      it("is segwit", () => {
        expect(tx.segwit).to.equal(true);
      });

      it("has witness", () => {
        expect((tx.txIns[0].witness[0] as Buffer).toString("hex")).to.equal(
          "304402206ef62a229dd1a7fe9cb1662edacfae7781c613b2b2a43053856e574c04e0924f02206eb551ea1b25cecaa2bca52de7328b3ae0a6546c27c0e57af52e89553b3372f001"
        );
        expect((tx.txIns[0].witness[1] as Buffer).toString("hex")).to.equal(
          "03d5d0477f9f41dff094a80aa19e92a69a622bb14c3c1918dc7a77a48d5d6af8b3"
        );
      });
    });
  });

  describe(".id()", () => {
    it("mainnet", async () => {
      const raw = "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      expect(tx.id()).to.equal(
        "ee51510d7bbabe28052038d1deb10c03ec74f06a79e21913c6fcf48d56217c87"
      );
    });
  });

  describe(".serialize()", () => {
    describe("legacy", () => {
      it("serializes", () => {
        const buf = Buffer.from(
          "010000000456919960ac691763688d3d3bcea9ad6ecaf875df5339e148a1fc61c6ed7a069e010000006a47304402204585bcdef85e6b1c6af5c2669d4830ff86e42dd205c0e089bc2a821657e951c002201024a10366077f87d6bce1f7100ad8cfa8a064b39d4e8fe4ea13a7b71aa8180f012102f0da57e85eec2934a82a585ea337ce2f4998b50ae699dd79f5880e253dafafb7feffffffeb8f51f4038dc17e6313cf831d4f02281c2a468bde0fafd37f1bf882729e7fd3000000006a47304402207899531a52d59a6de200179928ca900254a36b8dff8bb75f5f5d71b1cdc26125022008b422690b8461cb52c3cc30330b23d574351872b7c361e9aae3649071c1a7160121035d5c93d9ac96881f19ba1f686f15f009ded7c62efe85a872e6a19b43c15a2937feffffff567bf40595119d1bb8a3037c356efd56170b64cbcc160fb028fa10704b45d775000000006a47304402204c7c7818424c7f7911da6cddc59655a70af1cb5eaf17c69dadbfc74ffa0b662f02207599e08bc8023693ad4e9527dc42c34210f7a7d1d1ddfc8492b654a11e7620a0012102158b46fbdff65d0172b7989aec8850aa0dae49abfb84c81ae6e5b251a58ace5cfeffffffd63a5e6c16e620f86f375925b21cabaf736c779f88fd04dcad51d26690f7f345010000006a47304402200633ea0d3314bea0d95b3cd8dadb2ef79ea8331ffe1e61f762c0f6daea0fabde022029f23b3e9c30f080446150b23852028751635dcee2be669c2a1686a4b5edf304012103ffd6f4a67e94aba353a00882e563ff2722eb4cff0ad6006e86ee20dfe7520d55feffffff0251430f00000000001976a914ab0c0b2e98b1ab6dbf67d4750b0a56244948a87988ac005a6202000000001976a9143c82d7df364eb6c75be8c80df2b3eda8db57397088ac46430600",
          "hex"
        );
        const tx = Tx.parse(bufToStream(buf));
        const back = tx.serialize().toString("hex");
        expect(back).to.equal(buf.toString("hex"));
      });
    });

    describe(".segwit", () => {
      it("serializes", () => {
        const buf = Buffer.from(
          "01000000000102de5171fa8408be141b5b76eee5bc9473f7dc88608836538e6ea188767a0ff81c0000000000ffffffff91fe1e2b72b91a8a006133e43e200a76d15235e6649c80ec08b8c950a7fa58620200000000ffffffff03a83a00000000000016001489a8f6e17e9d35eac2f22fcd2ec81e20c0836e23a83a000000000000160014d72602e36124a8dfadf006d661b7758cd185db14021f030000000000160014f5c89211f860135b4ffda432a7b5e0c37cacc5f80247304402206ef62a229dd1a7fe9cb1662edacfae7781c613b2b2a43053856e574c04e0924f02206eb551ea1b25cecaa2bca52de7328b3ae0a6546c27c0e57af52e89553b3372f0012103d5d0477f9f41dff094a80aa19e92a69a622bb14c3c1918dc7a77a48d5d6af8b30247304402207fd85667b94f823c0c64c3b8d2db478b3f88f2c26812ab845183124406cb19fe022074c695f8a3bd4f0b2ea16931242fe711ff3a12d65a385562f96e74e2178a47fd012103bedaa9af254733ff24b3fadd0688368a2f2b5c8221df35abc3552d88feda992000000000",
          "hex"
        );
        const tx = Tx.parse(bufToStream(buf), true);
        const back = tx.serialize().toString("hex");
        expect(back).to.equal(buf.toString("hex"));
      });
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

  describe(".sigHashLegacy()", () => {
    it("p2pkh", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000001976a914a802fc56c704ce87c42d7c92eb75e7896bdc41ae88acfeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac1943060001000000"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const hash = await tx.sigHashLegacy(0);
      expect(hash.toString("hex")).to.equal(
        "27e0c5994dec7824e56dec6b2fcb342eb7cdb0d0957c2fce9882f715e85d81a6"
      );
    });

    it("p2sh", async () => {
      const rawTx =
        "0100000001868278ed6ddfb6c1ed3ad5f8181eb0c7a385aa0836f01d5e4789e6\
bd304d87221a000000db00483045022100dc92655fe37036f47756db8102e0d7d5e28b3beb83a8\
fef4f5dc0559bddfb94e02205a36d4e4e6c7fcd16658c50783e00c341609977aed3ad00937bf4e\
e942a8993701483045022100da6bee3c93766232079a01639d07fa869598749729ae323eab8eef\
53577d611b02207bef15429dcadce2121ea07f233115c6f09034c0be68db99980b9a6c5e754022\
01475221022626e955ea6ea6d98850c994f9107b036b1334f18ca8830bfff1295d21cfdb702103\
b287eaf122eea69030a0e9feed096bed8045c8b98bec453e1ffac7fbdbd4bb7152aeffffffff04\
d3b11400000000001976a914904a49878c0adfc3aa05de7afad2cc15f483a56a88ac7f40090000\
0000001976a914418327e3f3dda4cf5b9089325a4b95abdfa0334088ac722c0c00000000001976\
a914ba35042cfe9fc66fd35ac2224eebdafd1028ad2788acdc4ace020000000017a91474d691da\
1574e6b3c192ecfb52cc8984ee7b6c568700000000";
      const txStream = new TestStream(Buffer.from(rawTx, "hex"));
      const tx = Tx.parse(txStream);

      const rawRedeemScript =
        "475221022626e955ea6ea6d98850c994f9107b036b1334f18ca88\
30bfff1295d21cfdb702103b287eaf122eea69030a0e9feed096bed8045c8b98bec453e1ffac7f\
bdbd4bb7152ae";
      const redeemScriptStream = new TestStream(
        Buffer.from(rawRedeemScript, "hex")
      );
      const redeemScript = Script.parse(redeemScriptStream);

      const hash = await tx.sigHashLegacy(0, redeemScript);
      expect(hash.toString("hex")).to.equal(
        "e71bfa115715d6fd33796948126f40a8cdd39f187e4afb03896795189fe1423c"
      );
    });
  });

  describe(".hashPrevouts()", () => {
    it("p2wkh", () => {
      const tx = Tx.parse(bufToStream(p2wpkhBuf));
      const result = tx.hashPrevouts();
      expect(result.toString("hex")).to.equal(
        "96b827c8483d4e9b96712b6713a7b68d6e8003a781feba36c31143470b4efd37"
      );
    });

    it("p2sh-p2wpkh", () => {
      const tx = Tx.parse(bufToStream(p2sh_p2wpkh));
      const result = tx.hashPrevouts();
      expect(result.toString("hex")).to.equal(
        "b0287b4a252ac05af83d2dcef00ba313af78a3e9c329afa216eb3aa2a7b4613a"
      );
    });
  });

  describe(".hashSequence()", () => {
    it("p2wpkh", () => {
      const tx = Tx.parse(bufToStream(p2wpkhBuf));
      const result = tx.hashSequence();
      expect(result.toString("hex")).to.equal(
        "52b0a642eea2fb7ae638c36f6252b6750293dbe574a806984b8e4d8548339a3b"
      );
    });

    it("p2sh-p2wpkh", () => {
      const tx = Tx.parse(bufToStream(p2sh_p2wpkh));
      const result = tx.hashSequence();
      expect(result.toString("hex")).to.equal(
        "18606b350cd8bf565266bc352f0caddcf01e8fa789dd8a15386327cf8cabe198"
      );
    });
  });

  describe(".hashOutputs()", () => {
    it("p2wpkh", () => {
      const tx = Tx.parse(bufToStream(p2wpkhBuf));
      const result = tx.hashOutputs();
      expect(result.toString("hex")).to.equal(
        "863ef3e1a92afbfdb97f31ad0fc7683ee943e9abcf2501590ff8f6551f47e5e5"
      );
    });

    it("p2sh-p2wpkh", () => {
      const tx = Tx.parse(bufToStream(p2sh_p2wpkh));
      const result = tx.hashOutputs();
      expect(result.toString("hex")).to.equal(
        "de984f44532e2173ca0d64314fcefe6d30da6f8cf27bafa706da61df8a226c83"
      );
    });
  });

  describe(".sigHashSegwit()", () => {
    it("p2wpkh", async () => {
      const tx = Tx.parse(bufToStream(p2wpkhBuf));
      tx.txIns[1].prevTxValue = 600000000n; // override the value so no fetch is required
      const witness = Script.parse(
        streamFromHex("1976a9141d0f172a0ecb48aee1be1f2687d2963ae33f71a188ac")
      );
      const result = await tx.sigHashSegwit(1, undefined, witness);
      expect(result.toString("hex")).to.equal(
        "c37af31116d1b27caf68aae9e3ac82f1477929014d5b917657d0eb49478cb670"
      );
    });

    it("p2sh-p2wpkh", async () => {
      const tx = Tx.parse(bufToStream(p2sh_p2wpkh));
      tx.txIns[0].prevTxValue = 1000000000n; // override the value so no fetch is required
      const redeemScript = Script.parse(
        streamFromHex("16001479091972186c449eb1ded22b78e40d009bdf0089")
      );
      const result = await tx.sigHashSegwit(0, redeemScript);
      expect(result.toString("hex")).to.equal(
        "64f3b0f4dd2bb3aa1ce8566d220cc74dda9df97d8490cc81d89d735c92e59fb6"
      );
    });
  });

  describe(".verifyInput", () => {
    it("p2pkh input", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = Tx.parse(stream);
      const result = await tx.verifyInput(0);
      expect(result).to.equal(true);
    });

    it("p2sh input", async () => {
      const rawTx =
        "0100000001868278ed6ddfb6c1ed3ad5f8181eb0c7a385aa0836f01d5e4789e6\
bd304d87221a000000db00483045022100dc92655fe37036f47756db8102e0d7d5e28b3beb83a8\
fef4f5dc0559bddfb94e02205a36d4e4e6c7fcd16658c50783e00c341609977aed3ad00937bf4e\
e942a8993701483045022100da6bee3c93766232079a01639d07fa869598749729ae323eab8eef\
53577d611b02207bef15429dcadce2121ea07f233115c6f09034c0be68db99980b9a6c5e754022\
01475221022626e955ea6ea6d98850c994f9107b036b1334f18ca8830bfff1295d21cfdb702103\
b287eaf122eea69030a0e9feed096bed8045c8b98bec453e1ffac7fbdbd4bb7152aeffffffff04\
d3b11400000000001976a914904a49878c0adfc3aa05de7afad2cc15f483a56a88ac7f40090000\
0000001976a914418327e3f3dda4cf5b9089325a4b95abdfa0334088ac722c0c00000000001976\
a914ba35042cfe9fc66fd35ac2224eebdafd1028ad2788acdc4ace020000000017a91474d691da\
1574e6b3c192ecfb52cc8984ee7b6c568700000000";
      const txStream = new TestStream(Buffer.from(rawTx, "hex"));
      const tx = Tx.parse(txStream, false);
      expect(await tx.verifyInput(0)).to.equal(true);
    });

    it("p2wpkh input", async () => {
      const tx = Tx.parse(bufToStream(p2wpkhBuf));
      tx.txIns[1].prevTxValue = 600000000n;
      tx.txIns[1].prevTxScriptPubKey = p2wpkhScript(
        Buffer.from("141d0f172a0ecb48aee1be1f2687d2963ae33f71a1", "hex")
      );
      const result = await tx.verifyInput(1);
      expect(result).to.equal(true);
    });

    it("p2sh-p2wpkh input", async () => {
      const pk = new PrivateKey(0xeb696a065ef48a2192da5b28b694f87544b30fae8327c4510137a922f32c6dcfn); // prettier-ignore
      const tx = Tx.parse(bufToStream(p2sh_p2wpkh));
      tx.txIns[0].prevTxValue = 1000000000n;
      tx.txIns[0].prevTxScriptPubKey = p2shScript(p2wpkhScript(pk.point.hash160(true)).hash160()); // prettier-ignore
      const result = await tx.verifyInput(0);
      expect(result).to.equal(true);
    });
  });

  describe(".verify", () => {
    it("p2pkh tx", async () => {
      const raw = "0100000001813f79011acb80925dfe69b3def355fe914bd1d96a3f5f71bf8303c6a989c7d1000000006b483045022100ed81ff192e75a3fd2304004dcadb746fa5e24c5031ccfcf21320b0277457c98f02207a986d955c6e0cb35d446a89d3f56100f4d7f67801c31967743a9c8e10615bed01210349fc4e631e3624a545de3f89f5d8684c7b8138bd94bdd531d2e213bf016b278afeffffff02a135ef01000000001976a914bc3b654dca7e56b04dca18f2566cdaf02e8d9ada88ac99c39800000000001976a9141c4bc762dd5423e332166702cb75f40df79fea1288ac19430600"; // prettier-ignore
      const stream = new TestStream(Buffer.from(raw, "hex"));
      const tx = await Tx.parse(stream);
      const result = await tx.verify();
      expect(result).to.equal(true);
    });

    it("p2sh tx", async () => {
      const rawTx =
        "0100000001868278ed6ddfb6c1ed3ad5f8181eb0c7a385aa0836f01d5e4789e6\
bd304d87221a000000db00483045022100dc92655fe37036f47756db8102e0d7d5e28b3beb83a8\
fef4f5dc0559bddfb94e02205a36d4e4e6c7fcd16658c50783e00c341609977aed3ad00937bf4e\
e942a8993701483045022100da6bee3c93766232079a01639d07fa869598749729ae323eab8eef\
53577d611b02207bef15429dcadce2121ea07f233115c6f09034c0be68db99980b9a6c5e754022\
01475221022626e955ea6ea6d98850c994f9107b036b1334f18ca8830bfff1295d21cfdb702103\
b287eaf122eea69030a0e9feed096bed8045c8b98bec453e1ffac7fbdbd4bb7152aeffffffff04\
d3b11400000000001976a914904a49878c0adfc3aa05de7afad2cc15f483a56a88ac7f40090000\
0000001976a914418327e3f3dda4cf5b9089325a4b95abdfa0334088ac722c0c00000000001976\
a914ba35042cfe9fc66fd35ac2224eebdafd1028ad2788acdc4ace020000000017a91474d691da\
1574e6b3c192ecfb52cc8984ee7b6c568700000000";
      const txStream = new TestStream(Buffer.from(rawTx, "hex"));
      const tx = await Tx.parse(txStream, false);
      expect(await tx.verify()).to.equal(true);
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
      tx.testnet = true;
      tx.txIns.push(in1);
      tx.txOuts.push(out1);
      tx.txOuts.push(out2);

      const pk = new PrivateKey(BigInt("0x60226ca8fb12f6c8096011f36c5028f8b7850b63d495bc45ec3ca478a29b473d")); // prettier-ignore
      await tx.signInput(0, pk);

      const buf = tx.serialize();
      expect(buf.toString("hex")).to.equal(
        "0200000001fe9d7c4be76094189c396cc52b333364f06610fbd1fa95994f79ec8c869785cf010000006a473044022034903565f0c10373ad8884251c1af2b7f5ce029213f052ce10411c6ba090fac1022071f17d776536f800e5e24688ee2a341bbd05a776298287659005257e9948cf6f012102e577d441d501cace792c02bfe2cc15e59672199e2195770a61fd3288fc9f934fffffffff0284030000000000001976a9147dc70ca254627bebcb54c839984d32dad9092edf88acd0ffa700000000001976a914c34015187941b20ecda9378bb3cade86e80d2bfe88ac00000000"
      );
    });
  });

  describe("isCoinbase()", () => {
    it("false when not coinbase", () => {
      const tx = new Tx();
      tx.txIns.push(new TxIn(Buffer.alloc(32, 1).toString("hex"), 0n));
      expect(tx.isCoinbase()).to.equal(false);
    });

    it("true when coinbase", () => {
      const tx = new Tx();
      tx.txIns.push(
        new TxIn(Buffer.alloc(32).toString("hex"), BigInt(0xffffffff))
      );
      expect(tx.isCoinbase()).to.equal(true);
    });
  });

  describe(".coinbaseHeight()", () => {
    let tx: Tx;

    beforeEach(() => {
      tx = new Tx();
      tx.txIns.push(new TxIn("0".repeat(64), BigInt(0xffffffff)));
    });

    it("undefined when not coinbase", () => {
      tx.txIns.push(new TxIn("1".repeat(64), 0n));
      expect(tx.coinbaseHeight()).to.equal(undefined);
    });

    it("when not BIP0034 compatible", async () => {
      const buf = Buffer.from(
        "4d04ffff001d0104455468652054696d6573203033\
2f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64\
206261696c6f757420666f722062616e6b73",
        "hex"
      );
      tx.txIns[0].scriptSig = await Script.parse(bufToStream(buf));
      expect(Number(tx.coinbaseHeight())).to.equal(486604799);
    });

    it("height when BIP0034 compatible", async () => {
      const buf = Buffer.from(
        "5e03d71b07254d696e656420627920416e74506f6f\
6c20626a31312f4542312f4144362f43205914293101fabe6d6d678e2c8c34afc36896e7d94028\
24ed38e856676ee94bfdb0c6c4bcd8b2e5666a0400000000000000c7270000a5e00e00",
        "hex"
      );
      tx.txIns[0].scriptSig = await Script.parse(bufToStream(buf));
      expect(Number(tx.coinbaseHeight())).to.equal(465879);
    });
  });
});
