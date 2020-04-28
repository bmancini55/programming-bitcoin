/**
 * This is a blank message that is used to ack that a version message has been
 * received.
 */
export class VerAckMessage {
  public command: string = "verack";
  public serialize() {
    return Buffer.alloc(0);
  }
}
