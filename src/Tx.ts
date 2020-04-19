import { hash256 } from "./util/Hash256";
import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { TxIn } from "./TxIn";
import { TxOut } from "./TxOut";
import { combine, bufToStream } from "./util/BufferUtil";
import { bigToBufLE, bigFromBuf, bigToBuf } from "./util/BigIntUtil";
import { encodeVarint } from "./util/Varint";
import { Script } from "./script/Script";
import { PrivateKey } from "./ecc/PrivateKey";

export class Tx {
  public version: bigint;
  public readonly txIns: TxIn[];
  public readonly txOuts: TxOut[];
  public locktime: bigint;
  public testnet: boolean;

  public static async parse(stream: Readable): Promise<Tx> {
    const sr = new StreamReader(stream);

    // get the version
    const version = await sr.readUInt32LE();

    // obtain the inputs
    const inLen = await sr.readVarint();
    const ins = [];
    for (let i = 0n; i < inLen; i++) {
      ins.push(await TxIn.parse(stream));
    }

    // obtain the outputs
    const outLen = await sr.readVarint();
    const outs = [];
    for (let i = 0n; i < outLen; i++) {
      outs.push(await TxOut.parse(stream));
    }

    // locktime
    const locktime = await sr.readUInt32LE();

    return new Tx(version, ins, outs, locktime, true);
  }

  constructor(
    version: bigint = 1n,
    txIns: TxIn[] = [],
    txOuts: TxOut[] = [],
    locktime: bigint = 0n,
    testnet: boolean = false
  ) {
    this.version = version;
    this.txIns = txIns;
    this.txOuts = txOuts;
    this.locktime = locktime;
    this.testnet = testnet;
  }

  public toString() {
    const ins = this.txIns.map(p => p.toString()).join("\n");
    const outs = this.txOuts.map(p => p.toString()).join("\n");
    return [
      `version: ${this.version}`,
      `ins: ${ins}`,
      `outs: ${outs}`,
      `locktime: ${this.locktime}`,
      `testnet: ${this.testnet}`,
    ].join("\n");
  }

  /**
   * Returns the 32-byte hash as hexidecimal
   */
  public id(): string {
    return this.hash().toString("hex");
  }

  /**
   * Returns the hash256 of the transaction serialization in little-endian.
   */
  public hash(): Buffer {
    return hash256(this.serialize().reverse());
  }

  /**
   * Returns the byte serialization the transaction
   */
  public serialize(): Buffer {
    return combine(
      bigToBufLE(this.version, 4),
      encodeVarint(BigInt(this.txIns.length)),
      ...this.txIns.map(p => p.serialize()),
      encodeVarint(BigInt(this.txOuts.length)),
      ...this.txOuts.map(p => p.serialize()),
      bigToBufLE(this.locktime, 4)
    );
  }

  /**
   * Calculates the fees in satoshi
   */
  public async fees(testnet: boolean = false): Promise<bigint> {
    let inAmt = 0n;
    for (const txIn of this.txIns) {
      inAmt += await txIn.value(testnet);
    }

    let outAmt = 0n;
    for (const txOut of this.txOuts) {
      outAmt += txOut.amount;
    }

    return inAmt - outAmt;
  }

  /**
   * Performs a deep-copy clone of the current transaction
   */
  public async clone(): Promise<Tx> {
    return await Tx.parse(bufToStream(this.serialize()));
  }

  /**
   * Generates the signing hash for a specific input by doing the following:
   * 1. removing all scriptSig information and replacing it with a blank script object
   * 2. for the target input, replace scriptSig with the scriptPubKey obtained f
   *    from the original transaction
   * 3. serialize the transaction and append the 0x01000000 for the SIGHASH_ALL
   * 4. return hash256
   * @param input
   */
  public async sigHash(
    input: number,
    testnet: boolean = false
  ): Promise<Buffer> {
    // serialize version
    const version = bigToBufLE(this.version, 4);

    // serialize inputs and blank out scriptSig or
    // replace scriptSig for target input with scriptPubKey
    const txInLen = encodeVarint(BigInt(this.txIns.length));
    const txIns = [];
    for (let i = 0; i < this.txIns.length; i++) {
      const txIn = this.txIns[i];
      const newTxIn = new TxIn(
        txIn.prevTx,
        txIn.prevIndex,
        i === input ? await txIn.scriptPubKey(testnet) : new Script(),
        txIn.sequence
      );
      txIns.push(newTxIn.serialize());
    }

    const txOutLen = encodeVarint(BigInt(this.txOuts.length));
    const txOuts = this.txOuts.map(txOut => txOut.serialize());
    const locktime = bigToBufLE(this.locktime, 4);
    const sigHashType = bigToBufLE(1n, 4);

    return hash256(
      combine(
        version,
        txInLen,
        ...txIns,
        txOutLen,
        ...txOuts,
        locktime,
        sigHashType
      )
    );
  }

  /**
   * Verifies a single input by checking that the script correctly evaluates.
   * This method creates a sig_hash for the input, combines the scriptSig +
   * scriptPubKey for the input and evaluates the combined script.
   * @param i
   * @param testnet
   */
  public async verifyInput(
    i: number,
    testnet: boolean = false
  ): Promise<boolean> {
    const txin = this.txIns[i];
    const z = await this.sigHash(i, testnet);
    const pubKey = await txin.scriptPubKey(testnet);
    const combined = txin.scriptSig.add(pubKey);
    return combined.evaluate(z);
  }

  /**
   * Verifies the complete transaction by performing steps:
   * 1. Verifies that new bitcoins are not created
   * 2. Verifies each input evaluates
   *
   * Because this is a light node, we cannot verify that it
   * is a UTXO
   */
  public async verify(testnet: boolean = false): Promise<boolean> {
    // vefify no new bitcoins are created
    if ((await this.fees()) < 0) {
      return false;
    }

    // verify each input evaluates
    for (let i = 0; i < this.txIns.length; i++) {
      if (!(await this.verifyInput(i, testnet))) {
        return false;
      }
    }

    return true;
  }

  /**
   * Signs the input and assigns the signature to the script sig
   * @param i
   * @param pk
   * @param testnet
   */
  public async signInput(
    i: number,
    pk: PrivateKey,
    testnet: boolean = false
  ): Promise<boolean> {
    const txin = this.txIns[i];
    const z = await this.sigHash(i, testnet);
    const sig = pk.sign(bigFromBuf(z));
    const der = combine(sig.der(), bigToBuf(1n));
    const sec = pk.point.sec(true);
    txin.scriptSig = new Script([der, sec]);
    return this.verifyInput(i, testnet);
  }
}
