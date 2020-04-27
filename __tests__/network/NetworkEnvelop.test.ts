import { expect } from "chai";
import { NetworkEnvelope } from "../../src/network/NetworkEnvelope";
import { bufToStream } from "../../src/util/BufferUtil";

describe("NetworkEnvelop", () => {
  describe(".parse()", () => {
    it("verack", () => {
      const buf = Buffer.from(
        "f9beb4d976657261636b000000000000000000005df6e0e2",
        "hex"
      );
      const result = NetworkEnvelope.parse(bufToStream(buf));
      expect(result.command).to.equal("verack");
      expect(result.payload.length).to.equal(0);
    });

    it("version", () => {
      const buf = Buffer.from(
        "f9beb4d976657273696f6e0000000000650000005f1a69d2721101000100000000000000bc8f5e5400000000010000000000000000000000000000000000ffffc61b6409208d010000000000000000000000000000000000ffffcb0071c0208d128035cbc97953f80f2f5361746f7368693a302e392e332fcf05050001",
        "hex"
      );
      const result = NetworkEnvelope.parse(bufToStream(buf));
      expect(result.command).to.equal("version");
      expect(result.payload.length).to.equal(101);
    });
  });

  describe(".serialize()", () => {
    it("verack", () => {
      const buf = Buffer.from(
        "f9beb4d976657261636b000000000000000000005df6e0e2",
        "hex"
      );
      const msg = NetworkEnvelope.parse(bufToStream(buf));
      const result = msg.serialize();
      expect(result).to.deep.equal(buf);
    });

    it("version", () => {
      const buf = Buffer.from(
        "f9beb4d976657273696f6e0000000000650000005f1a69d2721101000100000000000000bc8f5e5400000000010000000000000000000000000000000000ffffc61b6409208d010000000000000000000000000000000000ffffcb0071c0208d128035cbc97953f80f2f5361746f7368693a302e392e332fcf05050001",
        "hex"
      );
      const msg = NetworkEnvelope.parse(bufToStream(buf));
      const result = msg.serialize();
      expect(result).to.deep.equal(buf);
    });
  });
});
