// tslint:disable: no-console
import { EventEmitter } from "events";
import { Socket } from "net";
import { INetworkMessage } from "./NetworkMessage";
import { NetworkEnvelope } from "./NetworkEnvelope";
import { VersionMessage } from "./VersionMessage";
import { VerAckMessage } from "./VerAckMessage";
import { bufToStream, combine } from "../util/BufferUtil";
import { PingMessage } from "./PingMessage";
import { PongMessage } from "./PongMessage";
import { runInThisContext } from "vm";

// tslint:disable-next-line: variable-name
export const NetworkMagic = Buffer.from("f9beb4d9", "hex");

// tslint:disable-next-line: variable-name
export const TestnetNetworkMagic = Buffer.from("0b110907", "hex");

/**
 *
 */
export class SimpleNode extends EventEmitter {
  public host: string;
  public port: bigint;
  public testnet: boolean;
  public logging: boolean;
  public socket: Socket;
  public receivedVerAck: boolean;
  public hasVersion: boolean;
  public remoteVersion: VersionMessage;
  public pendingHeader: Buffer;
  public pingInterval: number = 60000; // 1 min
  public pingTimeout: number = 20 * 60000; // 20 min
  private _sendPingHandle: NodeJS.Timeout;
  private _awaitPongHandle: NodeJS.Timeout;
  private _lastPing: PingMessage;

  constructor(
    host: string,
    port?: bigint,
    testnet: boolean = false,
    logging: boolean = false
  ) {
    super();
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
   * Closes the peer
   * @param reason
   */
  public close(reason: string) {
    if (this.logging) {
      console.log("node: closing", reason);
    }
    this.socket.end();
  }

  /**
   * Sends a new ping message
   */
  public sendPing() {
    this._awaitPongHandle = setTimeout(
      this.close.bind(this, "ping timedout"),
      this.pingTimeout
    );
    const msg = new PingMessage();
    this._lastPing = msg;
    this.send(msg);
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
   * Fires when the connection is disconnected
   */
  private _onClose() {
    this._unschedulePing();
    if (this.logging) {
      console.log("node: closed");
    }
  }

  /**
   * Clears any awaiting ping/pong timeouts
   */
  private _unschedulePing() {
    clearTimeout(this._sendPingHandle);
    clearTimeout(this._awaitPongHandle);
  }

  /**
   * Schedules the next poing
   */
  private _schedulePing() {
    this._unschedulePing();
    this._sendPingHandle = setTimeout(
      this.sendPing.bind(this),
      this.pingInterval
    );
    this._sendPingHandle.unref();
  }

  /**
   * Primate method that is triggered when there is a readable event caused by
   * data being recieved by the socket. This method will attempt to read the
   * data from the stream and take appropriate action based on the message.
   */
  private _onReadable() {
    while (true) {
      // read the header information
      const header = this.pendingHeader || this.socket.read(24);
      if (!header) {
        return;
      }

      // attempt to read the payload for the ehader
      const payloadLen = header.slice(16, 20).readUInt32LE();
      let payload: Buffer;
      if (payloadLen) {
        payload = this.socket.read(Number(payloadLen));
      } else {
        payload = Buffer.alloc(0);
      }

      // if we were unable to read the header, then we will stash the current
      // header until more information is available on the wire
      if (!payload) {
        this.pendingHeader = header;
        return;
      }

      // parse the full network envelope
      const stream = bufToStream(combine(header, payload));
      const env = NetworkEnvelope.parse(stream, this.testnet);
      this.pendingHeader = undefined;

      if (this.logging) {
        console.log("node: received", env.toString());
      }

      switch (env.command) {
        case "verack":
          this._onVerAck();
          break;
        case "version":
          this._onVersion();
          break;
        case "ping":
          const ping = PingMessage.parse(env.payloadStream);
          this._onPing(ping);
          break;
        case "pong":
          const msg = PongMessage.parse(env.payloadStream);
          this._onPong(msg);
          break;
      }
    }
  }

  /**
   * Handles a verack message
   */
  private _onVerAck() {
    this.receivedVerAck = true;
  }

  /**
   *
   */
  private _onVersion() {
    // send the verack message
    this.sendVerAck();

    // start the ping process
    this._schedulePing();

    // emit that the handshake is complete
    this.emit("handshake_complete");
  }

  /**
   * Handles an inbound ping message by sending a pong message reply
   * @param env
   */
  private _onPing(ping: PingMessage) {
    // create and send pong
    const pong = new PongMessage(ping.nonce);
    this.send(pong);
  }

  /**
   * Handles a pong message by validating that it matches the corresponding
   * ping. It then schedules the next ping.
   * @param msg
   */
  private _onPong(pong: PongMessage) {
    // abort if pong is invalid
    if (!pong.matches(this._lastPing)) {
      this.close("pong invalid");
    }

    // schedule the next ping
    this._schedulePing();
  }
}
