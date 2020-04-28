import { Readable } from "stream";
import { hash256 } from "../util/Hash256";
import { rstrip, combine } from "../util/BufferUtil";

// tslint:disable-next-line: variable-name
export const NetworkMagic = Buffer.from("f9beb4d9", "hex");

// tslint:disable-next-line: variable-name
export const TestnetNetworkMagic = Buffer.from("0b110907", "hex");

export class NetworkEnvelope {
  /**
   * Reads the network envelope off a steam and returns either a complete
   * network envelope with its payload or undefined when not enough information
   * is available on the buffer.
   *
   * ```
   * network magic - 4 bytes
   * command - 12 bytes, human-readable
   * payload length - 4 bytes LE
   * payload checksum - first 4-bytes of the hash256 of the payload
   * payload - data
   * ```
   * @param stream
   * @param testnet
   */
  public static parse(
    stream: Readable,
    testnet: boolean = false
  ): NetworkEnvelope {
    // read and validate the magic bytes
    const magic = stream.read(4);
    const expectedMagic = testnet ? TestnetNetworkMagic : NetworkMagic;
    if (!expectedMagic.equals(magic)) {
      throw new Error(`magic is not valid ${magic.toString("hex")}`);
    }

    // parse the stripped command
    const command = rstrip(stream.read(12), 0).toString();

    // parse the payload len and checksum
    const payloadLen = stream.read(4).readUInt32LE();
    const payloadChecksum = stream.read(4);

    // initialize to zero length buffer incase we don't need a read anything,
    // but otherwise read the payload
    let payload: Buffer;
    if (payloadLen) {
      payload = stream.read(Number(payloadLen));
    } else {
      payload = Buffer.alloc(0);
    }

    // verify the checksum
    const hash = hash256(payload).slice(0, 4);
    if (!hash.equals(payloadChecksum)) {
      throw new Error("checksum does not match");
    }

    // finally return the complete and validated network envelope
    return new NetworkEnvelope(command, payload, testnet);
  }

  /**
   * Human readable command that is at most 12-bytes
   */
  public command: string;

  /**
   * Payload of information that is at most 2^32 though in practice is
   * limited to 32MB.
   */
  public payload: Buffer;

  /**
   * Indicates if on testnet
   */
  public testnet: boolean;

  constructor(command: string, payload: Buffer, testnet: boolean = false) {
    this.command = command;
    this.payload = payload;
    this.testnet = testnet;
  }

  /**
   * Prints the network command and payload in hex
   */
  public toString() {
    return `${this.command}: ${this.payload.toString("hex")}`;
  }

  /**
   * Serializes the network message with the following format:
   *
   * network magic
   * command - 12 bytes
   * payload len - 4 bytes LE
   * payload checksum - 4 bytes
   * payload
   */
  public serialize(): Buffer {
    const envelope = Buffer.alloc(4 + 12 + 4 + 4);
    let offset = 0;

    // network magic, 4 bytes
    if (this.testnet) {
      TestnetNetworkMagic.copy(envelope);
    } else {
      NetworkMagic.copy(envelope);
    }
    offset += 4;

    // command
    envelope.write(this.command, offset);
    offset += 12;

    // payload len
    envelope.writeUInt32LE(this.payload.length, offset);
    offset += 4;

    // payload checksum
    const checksum = hash256(this.payload).slice(0, 4);
    checksum.copy(envelope, offset);
    offset += 4;

    // return envelop + payload
    return combine(envelope, this.payload);
  }
}
