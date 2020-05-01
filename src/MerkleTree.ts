import { merkleParent } from "./util/MerkleUtil";

export class MerkleTreeNode {
  public depth: number;
  public set: boolean;
  public left: MerkleTreeNode;
  public right: MerkleTreeNode;
  public hash: Buffer;

  constructor(hash?: Buffer) {
    this.hash = hash;
  }

  public calcHash() {
    this.hash = merkleParent(this.left.hash, this.right.hash);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class MerkleTree {
  public total: bigint;
  public maxDepth: number;
  public bits: bigint;
  public hashes: Buffer[];
  public depth: number;
  public rootNode: MerkleTreeNode;

  public get merkleRoot() {
    return Buffer.from(this.rootNode.hash);
  }

  public static fromHashes(hashes: Buffer[]) {
    // convert the initial hashes into leaf nodes
    let children = hashes.map(p => new MerkleTreeNode(p));

    while (children.length > 1) {
      const parents = [];

      // if odd, duplicate last node
      if (children.length % 2 === 1) {
        const last = children[children.length - 1];
        const dup = new MerkleTreeNode(last.hash);
        children.push(dup);
      }

      // combine lefts and rights
      for (let i = 0; i < children.length; i += 2) {
        const parent = new MerkleTreeNode();
        parent.left = children[i];
        parent.right = children[i + 1];
        parent.calcHash();
        parents.push(parent);
      }
      children = parents;
    }

    const result = new MerkleTree();
    result.rootNode = children[0];
    result.total = BigInt(hashes.length);
    result.maxDepth = Math.ceil(Math.log2(Number(hashes.length)));
    result.hashes = hashes;
    return result;
  }

  public static fromProof(total: bigint, bits: bigint, hashes: Buffer[]) {
    hashes = hashes.slice();
    const maxDepth = Math.ceil(Math.log2(Number(total)));
    const root = traverse(0);

    const result = new MerkleTree();
    result.total = total;
    result.bits = bits;
    result.hashes = hashes;
    result.maxDepth = maxDepth;
    result.rootNode = root;
    return result;

    function traverse(depth: number) {
      const set = (bits & 1n) === 1n;
      bits = bits >> 1n;

      const node = new MerkleTreeNode();
      node.depth = depth;
      node.set = set;

      // leaf node
      if (depth === maxDepth) {
        node.hash = hashes.shift();
      }
      // need to traverse, then build!
      else if (set) {
        node.left = traverse(depth + 1);
        node.right = traverse(depth + 1);
        node.calcHash();
      }
      // set is false and we are given this hash so use it
      else {
        node.hash = hashes.shift();
      }
      return node;
    }
  }
}
