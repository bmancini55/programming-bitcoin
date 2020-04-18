import { expect } from "chai";

export function createStack(len: number) {
  const stack = [];
  for (let i = 0; i < len; i++) {
    stack.push(Buffer.from([0x01]));
  }
  return stack;
}

export function testStackLen(
  op: (stack: Buffer[], ...other: any) => void,
  len: number,
  ...data: any
) {
  for (let i = 0; i < len; i++) {
    it("fails with stack length " + i, () => {
      expect(op(createStack(i), ...data)).to.equal(false);
    });
  }
}
