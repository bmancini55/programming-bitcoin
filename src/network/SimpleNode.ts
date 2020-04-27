import { Socket } from "net";
import { INetworkMessage } from "./NetworkMessage";
import { NetworkEnvelope } from "./NetworkEnvelope";

export class SimpleNode {
  public host: string;
  public port: bigint;
  public testnet: boolean;
  public logging: boolean;
  public socket: Socket;

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
    this.socket = new Socket();
    // this.socket.on("connect", this.onConnect.bind(this));
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
      console.log("sending:", envelope);
    }

    this.socket.write(envelope.serialize());
  }

  // /**
  //  * Reads a message from the socket
  //  */
  // public async read(): Promise<NetworkEnvelope> {
  //   const envelope = await NetworkEnvelope.parse(this.socket, this.testnet);

  //   if (this.logging) {
  //     console.log("receiving:", envelope);
  //   }

  //   return envelope;
  // }
}
