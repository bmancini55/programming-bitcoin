import { INetworkMessage } from "./NetworkMessage";
import { combine } from "../util/BufferUtil";
import { encodeVarint } from "../util/Varint";
import { bigToBufLE } from "../util/BigIntUtil";
import { InventoryVector } from "../InventoryVector";
import { InventoryType } from "../InventoryType";

/**
 * The getdata command is used to retrieve the actual information returned from
 * an inventory request. The inputs are a set of type, hash tuples.
 * Each tuple will return one of:
 *
 * TX - returns tx commands
 * BLOCK - returns block commands
 * FILTERED_BLOCK - returns merkleblock commands
 */
export class GetDataMessage implements INetworkMessage {
  public command: string = "getdata";
  public inventory: InventoryVector[];

  public constructor() {
    this.inventory = [];
  }

  /**
   * Adds an inventory record to the message
   * @param type
   * @param hash
   */
  public add(type: InventoryType, hash: Buffer) {
    this.inventory.push(new InventoryVector(type, hash));
  }

  public serialize(): Buffer {
    return combine(
      encodeVarint(BigInt(this.inventory.length)),
      ...this.inventory.map(iv => iv.serialize())
    );
  }
}
