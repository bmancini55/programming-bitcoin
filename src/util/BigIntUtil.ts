export function toBuffer(num: bigint): Buffer {
  let str = num.toString(16);
  if (str.length % 2 === 1) str = "0" + str;
  return Buffer.from(str, "hex");
}

export function fromBuffer(buf: Buffer): bigint {
  return BigInt("0x" + buf.toString("hex"));
}
