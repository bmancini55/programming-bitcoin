import { merkleParent } from "./util/MerkleUtil";

/**
 * Node/pointer based merkle tree that can be constructed from a list of hashes
 * or constructed from a merkle inclusion proof that is used with Bitcoin. This
 * class is not concerned with byte-ordering. That is the responsibility of the
 * consumer!
 */
export class MerkleTree {
  /**
   * Constructs a full merkle tree from the supplied hashes. The supplied hashes
   * are the leaves of the tree. This performs a bottom up construction where
   * each level is created by combining two nodes from below. If there are an
   * odd number of nodes at the level, the last value is duplicated. The
   * construction stops when there is only a single node and this is the root.
   * @param hashes
   */
  public static fromHashes(hashes: Buffer[]): MerkleTree {
    // convert the initial hashes into leaf nodes
    let children = hashes.map(p => new MerkleTree(p));

    // continue looping until there is only a single node
    while (children.length > 1) {
      const parents = [];

      // pair up nodes and construct a parent from the pair
      for (let i = 0; i < children.length; i += 2) {
        const parent = new MerkleTree();
        parent.left = children[i];
        if (children[i + 1]) {
          parent.right = children[i + 1];
        }
        parent.setHash();
        parents.push(parent);
      }

      // all pairs have been made so we can now move up a level in our tree
      children = parents;
    }

    // return the single node, which is the root
    return children[0];
  }

  /**
   * Creates a merkle tree from the provided information send in a merkleblock
   * command. This command does not send all hashes, but only includes the ones
   * necessary to create the merkle root. In order to interpret the meaning of
   * the hashes, a bits field is used. The argorihtm uses a pre-order traversal
   * to interpret the bits (starting at the root).
   *
   * In practice, nodes that we need to calculate are skipped and we traverse
   * until we encounter hash values that have been provided. With those hash
   * values we can traverse back up the tree and perform the calculations that
   * were originally skipped.
   *
   * @param total hashes
   * @param bits indicate the meaning of the hashes
   * @param hashes list of hashes
   */
  public static fromProof(
    total: bigint,
    bits: bigint,
    hashes: Buffer[]
  ): MerkleTree {
    // create copy of hashes so we can shift values from the front as needed
    hashes = hashes.slice();

    // calculate the max depth of the tree which is ceil(log2(h))
    const leafDepth = Math.ceil(Math.log2(Number(total)));

    // pre-order construction starting at depth 0
    const root = construct(0);

    // verify that everything was consumed
    if (bits > 0n || hashes.length) {
      throw new Error("construction failed");
    }

    return root;

    // performs a pre-order constrution of the merkle tree. Pre-order means we
    // traverse the tree in order: root, left, right. In this instance, we
    // construct a new node first, then determine if we need to perform any
    // traversals
    function construct(depth: number) {
      // read and remove the least-significant bit which will provide meaning
      // to the hashes that were provided
      const bit = bits & 1n;
      bits = bits >> 1n;

      // construct our node (pre-order)
      const node = new MerkleTree();

      // leaf node always shifts off a hash value becuase it will either be a
      // target (bit=1) and include a hash or it will be included hash (bit=0).
      // either way, there is no need to traverse further. Return null if no
      // hashes left as this is a odd node and will be duplicated.
      if (depth === leafDepth) {
        node.hash = hashes.shift();
        if (!node.hash) return;
      }

      // since the bit is set we are responsible for calculating the hash,
      // we need to continue the traversal (left, then right) and can compute
      // the hash once the traversal is complete (and we have what we need).
      else if (bit === 1n) {
        node.left = construct(depth + 1);
        node.right = construct(depth + 1);
        node.setHash();
      }

      // when bit=0, we are given the hash value since it counters are target.
      // Return null if no hashes left as this is a odd node and will be
      // duplicated.
      else {
        node.hash = hashes.shift();
        if (!node.hash) return;
      }

      return node;
    }
  }

  /**
   * Left subtree
   */
  public left: MerkleTree;

  /**
   * Right subtree
   */
  public right: MerkleTree;

  /**
   * Hash that is either provide or populated via calcHash method
   */
  public hash: Buffer;

  constructor(hash?: Buffer) {
    this.hash = hash;
  }

  /**
   * Calculates and sets the hash for the node by concatenating the left and
   * right hash values and performing a hash256 on the combined data. If the
   * right node is missing, just duplicate the left
   */
  public setHash() {
    const left = this.left.hash;
    const right = this.right ? this.right.hash : left;
    this.hash = merkleParent(left, right);
  }
}
