// tslint:disable: no-console
import { Socket } from "net";
import { INetworkMessage } from "./NetworkMessage";
import { NetworkEnvelope } from "./NetworkEnvelope";
import { VersionMessage } from "./VersionMessage";
import { VerAckMessage } from "./VerAckMessage";
import { rstrip, bufToStream, combine } from "../util/BufferUtil";
import { hash256 } from "../util/Hash256";

// tslint:disable-next-line: variable-name
export const NetworkMagic = Buffer.from("f9beb4d9", "hex");

// tslint:disable-next-line: variable-name
export const TestnetNetworkMagic = Buffer.from("0b110907", "hex");

export class SimpleNode {
  public host: string;
  public port: bigint;
  public testnet: boolean;
  public logging: boolean;
  public socket: Socket;
  public receivedVerAck: boolean;
  public hasVersion: boolean;
  public remoteVersion: VersionMessage;
  public pendingChunk: Buffer;

  constructor(
    host: string,
    port?: bigint,
    testnet: boolean = false,
    logging: boolean = false
  ) {
    this.host = host;
    if (!port) {
      if (testnet) port = 18333n;
      else port = 8333n;
    }
    this.port = port;
    this.testnet = testnet;
    this.logging = logging;
    this.receivedVerAck = false;
    this.hasVersion = false;
    this.socket = new Socket();
    this.socket.on("connect", this._onConnect.bind(this));
    this.socket.on("readable", this._onReadable.bind(this));
    this.socket.on("close", this._onClose.bind(this));

    if (this.logging) {
      console.log("node: connecting to", host, port);
    }

    this.socket.connect({ host, port: Number(port) });
  }

  /**
   * Sends a message to the connected node on the network
   * @param msg
   */
  public send(msg: INetworkMessage) {
    const envelope = new NetworkEnvelope(
      msg.command,
      msg.serialize(),
      this.testnet
    );

    if (this.logging) {
      console.log("node: sending", envelope.toString());
    }

    this.socket.write(envelope.serialize());
  }

  /**
   * Sends a version message to the connected node
   */
  public sendVersion() {
    this.send(new VersionMessage());
  }

  /**
   * Sends a verack message to the connected node
   */
  public sendVerAck() {
    this.send(new VerAckMessage());
  }

  /**
   * Private method that fires when the remote connection is established. In
   * this instance, the version message is sent to the remote node.
   */
  private _onConnect() {
    if (this.logging) {
      console.log("node: connected to remote node");
    }
    this.sendVersion();
  }

  /**
   * Primate method that is triggered when there is a readable event caused by
   * data being recieved by the socket. This method will attempt to read the
   * data from the stream and take appropriate action based on the message.
   */
  private _onReadable() {
    while (true) {
      const chunk = this.pendingChunk || this.socket.read(24);
      if (!chunk) {
        return;
      }

      const payloadLen = chunk.slice(16, 20).readUInt32LE();

      let payload: Buffer;
      if (payloadLen) {
        payload = this.socket.read(Number(payloadLen));
      } else {
        payload = Buffer.alloc(0);
      }

      if (!payload) {
        this.pendingChunk = chunk;
        return;
      }

      const stream = bufToStream(combine(chunk, payload));
      const env = NetworkEnvelope.parse(stream, this.testnet);
      this.pendingChunk = undefined;

      if (this.logging) {
        console.log("node: received", env.toString());
      }

      switch (env.command) {
        case "verack":
          this.receivedVerAck = true;
          break;
        case "version":
          this.sendVerAck();
          break;
      }
    }
  }
  private _onClose() {
    if (this.logging) {
      console.log("node: closing");
    }
  }
}
