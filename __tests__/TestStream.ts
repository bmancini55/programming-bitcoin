import { Readable } from "stream";

export class TestStream extends Readable {
  private _data: number[];

  constructor(data?: number[]) {
    super();
    this._data = [];
    if (data) {
      this._data.push(...data);
    }
  }

  public _read(size) {
    const nums = this._data.splice(0, size);
    this.push(Buffer.from(nums));
  }

  public add(chunk: number[]) {
    this._data.push(...chunk);
    this.emit("readable");
  }
}
