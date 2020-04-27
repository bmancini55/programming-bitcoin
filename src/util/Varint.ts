import { Readable } from "stream";
import { bigFromBufLE } from "./BigIntUtil";

export function decodeVarint(stream: Readable): bigint {
  const i = stream.read(1).readUInt8();

  // 0xfd means UInt16 and reads two bytes little-endian
  if (i === 0xfd) {
    return bigFromBufLE(stream.read(2));
  }
  // 0xfe means UInt32 and reads four bytes little-endian
  else if (i === 0xfe) {
    return bigFromBufLE(stream.read(4));
  }
  // 0xff means UInt64 and reads eight bytse little-endian
  else if (i === 0xff) {
    return bigFromBufLE(stream.read(8));
  }
  // everything else is just the integer
  else {
    return BigInt(i);
  }
}

export function encodeVarint(i: bigint | number): Buffer {
  // 8-bit, 1-byte number
  if (i < BigInt("0xfd")) {
    return Buffer.from([Number(i)]);
  }
  // 16-bit, 2-byte number
  else if (i < BigInt("0x10000")) {
    const buf = Buffer.alloc(3);
    buf[0] = 0xfd;
    buf.writeUInt16LE(Number(i), 1);
    return buf;
  }
  // 32-bit, 4-byte number
  else if (i < BigInt("0x100000000")) {
    const buf = Buffer.alloc(5);
    buf[0] = 0xfe;
    buf.writeUInt32LE(Number(i), 1);
    return buf;
  }
  // 64-bit, 8-byte number
  else if (i < BigInt("0x10000000000000000")) {
    const buf = Buffer.alloc(9);
    buf[0] = 0xff;
    buf.writeBigUInt64LE(BigInt(i), 1);
    return buf;
  }
  // too large
  else {
    throw new Error(`Integer too large ${i}`);
  }
}
