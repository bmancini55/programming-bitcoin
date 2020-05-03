import { bigFromBufLE, bigFromBuf } from "./util/BigIntUtil";
import { Readable } from "stream";
import { decodeVarint } from "./util/Varint";
import { MerkleTree } from "./MerkleTree";

export class MerkleBlock {
  /**
   * Parses a merkelblock command. This essentially contains the information
   * used in a standard block plus the inclusion of information needed to
   * construct the partial merkle tree.
   *
   * version - 4 bytes LE,
   * prev_block - 32 bytes IBO
   * merkle_root - 32 bytes IBO
   * timestamp - 4 bytes LE
   * bits - 4 bytes IBO
   * nonce - 4 bytes IBO
   *
   * total - 4 bytes LE
   * numHashes - varint
   * hashes - 32-bytes * numHashes
   * flagsLen - varint
   * flags - bytes LE
   *
   * @param stream
   */
  public static parse(stream: Readable): MerkleBlock {
    // stadnard block header data - 80 bytes
    const version = bigFromBufLE(stream.read(4)); // 4 bytes, LE
    const prevBlock = stream.read(32).reverse(); // 32 bytes, IBO
    const merkleRoot = stream.read(32).reverse(); // 32 bytes, IBO
    const timestamp = bigFromBufLE(stream.read(4)); // 4 bytes, LE
    const bits = stream.read(4).reverse(); // 4 bytes, IBO
    const nonce = stream.read(4).reverse(); // 4 bytes, IBO

    // additional data needed to parse the partial merkle tree
    const totalTxs = bigFromBufLE(stream.read(4)); // 4 bytes LE
    const numHashes = decodeVarint(stream); // num hashes, varint
    const hashes = [];
    for (let i = 0n; i < numHashes; i++) {
      hashes.push(stream.read(32).reverse()); // 32 bytes, IBO
    }
    const flagsLen = decodeVarint(stream); // varint
    const flags = bigFromBufLE(stream.read(Number(flagsLen))); // flags, LE

    return new MerkleBlock(
      version,
      prevBlock,
      merkleRoot,
      timestamp,
      bits,
      nonce,
      totalTxs,
      hashes,
      flags
    );
  }

  /**
   * Version of the block
   */
  public version: bigint;

  /**
   * Previous block in RPC byte order
   */
  public prevBlock: Buffer;

  /**
   * Merkle root as 32-bytes in RPC byte order.
   */
  public merkleroot: Buffer;

  /**
   * Unix style timestamp which is the number of seconds elapsed since
   * January 1, 1970. This value will eventually overflow in 2106.
   */
  public timestamp: bigint;

  /**
   * Bits, compact encoding of the target in RPC byte order
   */
  public bits: Buffer;

  /**
   * Nonce in RCP byte order
   */
  public nonce: Buffer;

  /**
   * Total number of transactions in the block
   */
  public total: bigint;

  /**
   * Hashes that will be used to construct the partial merkle tree
   */
  public hashes: Buffer[];

  /**
   * Flags used to construct the partial merkle tree.
   */
  public flags: bigint;

  constructor(
    version: bigint,
    prevBlock: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    bits: Buffer,
    nonce: Buffer,
    total: bigint,
    hashes: Buffer[],
    flags: bigint
  ) {
    this.version = version;
    this.prevBlock = prevBlock;
    this.merkleroot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
    this.total = total;
    this.hashes = hashes;
    this.flags = flags;
  }

  /**
   * Returns true if the reconsturction of the MerkleTree matches the provided
   * merkle root.
   */
  public isValid() {
    // first convert the hashes back to internal byte-order
    const hashes = this.hashes.map(h => Buffer.from(h).reverse());

    // reconstruct the tree
    const merkleTree = MerkleTree.fromProof(this.total, this.flags, hashes);

    // return if the tree matches the provided merkle root
    return this.merkleroot.equals(Buffer.from(merkleTree.hash).reverse());
  }
}
