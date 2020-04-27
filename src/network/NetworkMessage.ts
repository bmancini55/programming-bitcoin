export interface INetworkMessage {
  command: string;
  serialize(): Buffer;
}
