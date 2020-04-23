import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";
import { writeBytesReverse, writeBytes } from "./util/BufferUtil";

export class Block {
  /**
   * Parses a block header. The previous block and merkle root are transmitted
   * in little-endian format and must be converted to big-endian. For example:
   *
   * ```
   * 02000020 - version, 4-byte LE
   * 8ec39428b17323fa0ddec8e887b4a7c53b8c0a0a220cfd000000000000000000 - previous block, 32-bytes LE
   * 5b0750fce0a889502d40508d39576821155e9c9e3f5c3157f961db38fd8b25be - merkle root, 32-bytes LE
   * 1e77a759 - timestamp, 4-byte LE
   * e93c0118 - bits, 4-byte
   * a4ffd71d - nonce, 4-byte
   * ```
   * @example
   * ```typescript
   * const stream = bufToStream(Buffer.from("020000208ec39428b17323fa0ddec8e887b4a7\
   * c53b8c0a0a220cfd0000000000000000005b0750fce0a889502d40508d39576821155e9c9e3f5c\
   * 3157f961db38fd8b25be1e77a759e93c0118a4ffd71d"), "hex");
   * const block = await Block.parse(stream);
   * ```
   * @param stream
   */
  public static async parse(stream: Readable): Promise<Block> {
    const sr = new StreamReader(stream);
    const version = await sr.readUInt32LE();
    const prevBlock = (await sr.read(32)).reverse(); // convert LE to BE
    const merkleRoot = (await sr.read(32)).reverse(); // convert LE to BE
    const timestamp = await sr.readUInt32LE();
    const bits = await sr.read(4);
    const nonce = await sr.read(4);
    return new Block(version, prevBlock, merkleRoot, timestamp, bits, nonce);
  }

  /**
   * Version
   */
  public version: bigint;

  /**
   * Previous block as 32-bytes in big-endian
   */
  public prevBlock: Buffer;

  /**
   * Merkle root as 32-bytes in big-endian
   */
  public merkleRoot: Buffer;

  /**
   *
   */
  public timestamp: bigint;

  /**
   *
   */
  public bits: Buffer;

  /**
   *
   */
  public nonce: Buffer;

  /**
   * Represents a Block
   * @param version
   * @param prevBlock
   * @param merkleRoot
   * @param timestamp
   * @param bits
   * @param nonce
   */
  constructor(
    version: bigint,
    prevBlock: Buffer,
    merkleRoot: Buffer,
    timestamp: bigint,
    bits: Buffer,
    nonce: Buffer
  ) {
    this.version = version;
    this.prevBlock = prevBlock;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp;
    this.bits = bits;
    this.nonce = nonce;
  }

  /**
   * Serializes the block into a Buffer according to the following information
   *
   * version - 4 bytes LE
   * previous block - 32 bytes LE
   * merkle root - 32 bytes LE
   * timestamp - 4 bytes LE
   * bits - 4 bytes
   * nonce - 4 bytes
   */
  public serialize(): Buffer {
    const result = Buffer.alloc(4 + 32 + 32 + 4 + 4 + 4);
    let offset = 0;

    // version, 4 bytes LE
    result.writeUInt32LE(Number(this.version), offset);
    offset += 4;

    // previous block, 32 bytes LE
    writeBytesReverse(this.prevBlock, result, offset);
    offset += 32;

    // merkle root, 32 bytes LE
    writeBytesReverse(this.merkleRoot, result, offset);
    offset += 32;

    // timestamp, 4 bytes LE
    result.writeUInt32LE(Number(this.timestamp), offset);
    offset += 4;

    // bits, 4 bytes
    writeBytes(this.bits, result, offset);
    offset += 4;

    // nonce, 4 bytes
    writeBytes(this.nonce, result, offset);
    offset += 4;

    return result;
  }
}
