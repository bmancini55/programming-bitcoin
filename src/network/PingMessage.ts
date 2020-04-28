import crypto from "crypto";
import { INetworkMessage } from "./NetworkMessage";
import { Readable } from "stream";

/**
 * The ping message is sent primarily to confirm that the TCP/IP connection is
 * still valid. An error in transmission is presumed to be a closed connection
 * and the address is removed as a current peer.
 */
export class PingMessage implements INetworkMessage {
  public static parse(stream: Readable): PingMessage {
    const nonce = stream.read(8);
    return new PingMessage(nonce);
  }

  public command: string = "ping";
  public nonce: Buffer;

  public constructor(nonce?: Buffer) {
    this.nonce = nonce || crypto.randomBytes(8);
  }

  public serialize(): Buffer {
    return this.nonce;
  }
}
