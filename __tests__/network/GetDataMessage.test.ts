import { expect } from "chai";
import { GetDataMessage } from "../../src/network/GetDataMessage";
import { InventoryType } from "../../src/InventoryType";

describe("GetDataMessage", () => {
  describe(".serialize()", () => {
    it("serializes", () => {
      const msg = new GetDataMessage();
      msg.add(
        InventoryType.FilteredBlock,
        Buffer.from(
          "00000000000000cac712b726e4326e596170574c01a16001692510c44025eb30",
          "hex"
        )
      );
      msg.add(
        InventoryType.FilteredBlock,
        Buffer.from(
          "00000000000000beb88910c46f6b442312361c6693a7fb52065b583979844910",
          "hex"
        )
      );
      expect(msg.serialize().toString("hex")).to.equal(
        "020300000030eb2540c41025690160a1014c577061596e32e426b712c7ca00000000000000030000001049847939585b0652fba793661c361223446b6fc41089b8be00000000000000"
      );
    });
  });
});
