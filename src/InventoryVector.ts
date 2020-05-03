import { InventoryType } from "./InventoryType";
import { combine } from "./util/BufferUtil";
import { bigToBufLE } from "./util/BigIntUtil";

/**
 * Inventory vectors are used for notifying other nodes about objects they have
 * or data which is being requested.
 */
export class InventoryVector {
  constructor(readonly type: InventoryType, readonly data: Buffer) {}

  /**
   * Serializes the inventory vector according to:
   *
   * type: 4-byte LE
   * hash: 32-bytes, internal byte order
   */
  public serialize() {
    return combine(
      bigToBufLE(BigInt(this.type), 4), // 4-byte LE
      Buffer.from(this.data).reverse() // 32-bytes, internal byte order
    );
  }
}
