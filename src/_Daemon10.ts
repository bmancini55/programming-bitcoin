// tslint:disable: no-console
/**
 * This is an example from chapter 10. This example connects to a peer, performs
 * a handshake and request a range of headers starting from the genesis block.
 * Headers are send 2000 at a time. After validating the consensus rules for
 * those headers, additional batch of headers is requested.
 *
 * The following consensus rules are validated:
 *   1. PoW is valid
 *   2. The previous block is correct
 *   3. For mainnet whether the bits are correctly set for each block
 */

import { SimpleNode } from "./network/SimpleNode";
import { Block } from "./Block";
import { GetHeadersMessage } from "./network/GetHeadersMessage";
import { HeadersMessage } from "./network/HeadersMessage";
import { calcNewBits } from "./util/BlockUtil";

let host: string;
let testnet: boolean;
let genesis: Block;

if (process.argv[2] === "testnet") {
  testnet = true;
  host = "testnet.programmingbitcoin.com";
  genesis = Block.testnetGensisBlock;
} else {
  testnet = false;
  host = "mainnet.programmingbitcoin.com";
  genesis = Block.genesisBlock;
}

const maxBlocksToLoad = 100000;
const logging = true;
const blocks: Block[] = [genesis];
let epochBits: Buffer = Buffer.from("1d00ffff", "hex");
let epochStartBlock = genesis;

// construct our node
const node = new SimpleNode(host, undefined, testnet, logging);

node.on("handshake_complete", () => {
  // request headers
  const getheaders = new GetHeadersMessage(genesis.hash());
  node.send(getheaders);
});

node.on("headers", (headers: HeadersMessage) => {
  // validate all received blocks
  for (const block of headers.blocks) {
    const previous = blocks[blocks.length - 1];

    // check the PoW
    if (!block.checkProofOfWork()) {
      throw new Error("bad PoW at block at block " + blocks.length);
    }

    // ensure previous block is chained correctly
    if (!block.prevBlock.equals(previous.hash())) {
      throw new Error("discontinuous block at " + blocks.length);
    }

    // validate expected bits if on mainnet. Can't validate the bits on
    // testnet becuase of difficulty adjustment that can happen every 20
    // minutes
    if (!testnet) {
      // calculate the new target every 2016 blocks, this also captures the
      // first block for the difficulty adjustment period
      if (blocks.length % 2016 === 0) {
        epochBits = calcNewBits(
          epochStartBlock.bits,
          previous.timestamp - epochStartBlock.timestamp
        );
        epochStartBlock = block;
        console.log("node: target bits now", epochBits.toString("hex"));
      }

      // check the bits match the epoch bits, all blocks in the period must
      // have the same bits
      if (!block.bits.equals(epochBits)) {
        throw new Error("bad bits at block " + blocks.length);
      }
    }

    // add the block to our list of blocks
    blocks.push(block);

    if (logging) {
      console.log(
        "node: block " + blocks.length + " " + block.hash().toString("hex")
      );
    }
  }

  // once all blocks have been validated, we can request more headers starting
  // with our last know block
  if (blocks.length < maxBlocksToLoad) {
    const start = blocks[blocks.length - 1].hash();
    const getheaders = new GetHeadersMessage(start);
    node.send(getheaders);
  }
});
