import { expect } from "chai";
import { StreamReader } from "../../src/util/StreamReader";
import { TestStream } from "../TestStream";

describe("StreamReader", () => {
  describe(".read()", () => {
    it("read all", async () => {
      const stream = new TestStream([1, 2, 3]);
      const data = await new StreamReader(stream).read();
      expect(data.toString("hex")).to.equal("010203");
    });

    it("read exact", async () => {
      const stream = new TestStream([1]);
      const data = await new StreamReader(stream).read(1);
      expect(data.toString("hex")).to.equal("01");
    });

    it("read exact when more", async () => {
      const stream = new TestStream([1, 2, 3]);
      const data = await new StreamReader(stream).read(1);
      expect(data.toString("hex")).to.equal("01");
    });

    it("block when not enough", async () => {
      const stream = new TestStream([1, 2, 3]);
      setTimeout(() => stream.add([4]), 1);
      const data = await new StreamReader(stream).read(4);
      expect(data.toString("hex")).to.equal("01020304");
    });

    it("block when not enough", async () => {
      const stream = new TestStream([1, 2, 3]);
      setTimeout(() => stream.add([4]), 1);
      setTimeout(() => stream.add([5]), 1);
      const data = await new StreamReader(stream).read(5);
      expect(data.toString("hex")).to.equal("0102030405");
    });
  });
});
