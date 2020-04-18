import { expect } from "chai";

export function createStack(len: number) {
  const stack = [];
  for (let i = 0; i < len; i++) {
    stack.push(Buffer.from([0x01]));
  }
  return stack;
}

export function testStackLen(op: (stack: Buffer[]) => void, len: number) {
  for (let i = 0; i < len; i++) {
    it("fails with stack length " + i, () => {
      expect(op(createStack(i))).to.equal(false);
    });
  }
}
