import { Readable } from "stream";
import { StreamReader } from "./util/StreamReader";

export class Script {
  public data: Buffer;

  public static async parse(stream: Readable) {
    const sr = new StreamReader(stream);
    const len = await sr.readVarint();
    const data = await sr.read(Number(len));
    return new Script(data);
  }
  constructor(data: Buffer) {
    this.data = data;
  }
}
