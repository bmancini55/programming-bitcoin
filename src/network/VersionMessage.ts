import crypto from "crypto";
import { Readable } from "stream";
import { StreamReader } from "../util/StreamReader";
import { combine } from "../util/BufferUtil";
import { bigToBufLE, bigToBuf } from "../util/BigIntUtil";
import { encodeVarint } from "../util/Varint";

export class VersionMessage {
  public command: string = "version";
  public version: bigint = 70015n;
  public services: bigint = 0n;
  public timestamp: bigint = BigInt(Math.floor(Date.now() / 1000));
  public receiverServices: bigint = 0n;
  public receiverIp: Buffer = Buffer.from([0, 0, 0, 0]);
  public receiverPort: bigint = 8333n;
  public senderServices: bigint = 0n;
  public senderIp: Buffer = Buffer.from([0, 0, 0, 0]);
  public senderPort: bigint = 8333n;
  public nonce: Buffer = crypto.randomBytes(8);
  public userAgent: Buffer = Buffer.from("/programmingbitcoin:0.1/");
  public latestBlock: bigint = 0n;
  public relay: boolean = false;

  /**
   * Serializes the version message
   */
  public serialize() {
    return combine(
      bigToBufLE(this.version, 4),
      bigToBufLE(this.services, 8),
      bigToBufLE(this.timestamp, 8),
      bigToBufLE(this.receiverServices, 8),
      Buffer.from("00000000000000000000ffff", "hex"), // 12-bytes + 4 bytes
      this.receiverIp,
      bigToBuf(this.receiverPort, 2),
      bigToBufLE(this.senderServices, 8),
      Buffer.from("00000000000000000000ffff", "hex"), // 12-bytes
      this.senderIp,
      bigToBuf(this.senderPort, 2),
      this.nonce,
      encodeVarint(BigInt(this.userAgent.length)),
      this.userAgent,
      bigToBuf(this.latestBlock, 4),
      Buffer.alloc(1, this.relay ? 1 : 0)
    );
  }
}
