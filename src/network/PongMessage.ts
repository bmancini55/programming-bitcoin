import { INetworkMessage } from "./NetworkMessage";
import { PingMessage } from "./PingMessage";
import { Readable } from "stream";

/**
 * The pong message is sent in response to a ping message. In modern protocol
 * versions, a pong response is generated using a nonce included in the ping.
 */
export class PongMessage implements INetworkMessage {
  public static parse(stream: Readable): PongMessage {
    const nonce = stream.read(8);
    return new PongMessage(nonce);
  }

  public command: string = "pong";
  public nonce: Buffer;

  constructor(nonce: Buffer) {
    this.nonce = nonce;
  }

  public serialize(): Buffer {
    return this.nonce;
  }

  public matches(ping: PingMessage): boolean {
    if (!ping) return false;
    return ping.nonce.equals(this.nonce);
  }
}
