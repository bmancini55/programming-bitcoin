// tslint:disable: no-console
/**
 * This example is for the end of Chapter 12. It simulates an SPV node that
 * wants to watch for a specific address: mwJn1YPMq7y5F8J3LkC5Hxg9PHyZ5K4cFv.
 * To accomplish this, it creates a bloom filter and adds our address to it.
 * We provide this bloomfilter to the remote using the `filterload` command and
 * then request data from the remote node. Any matched transactions will result
 * in a partial merkle tree and the full transactiono. With the partial merkle
 * block, we can verify that the transaction was included.
 *
 * Usually after the  connection handshake, we would load all block headers.
 * We shortcut this process by just loading from block 1414317 to make the demo
 * work faster.
 *
 * The following commands are used in this demo code:
 *
 * getheaders  => send a request for a range of block headers
 * headers     <= range of block headers fitting our range
 *
 * getdata     => send a request for filtered blocks for any blocks we are
 *                curious about.
 * merkleblock <= includes partial merkle tree for each block requested in
 *                getdata. Any matched transactions will be sent in a tx
 *                message.
 * tx          <= matched transactions are sent to the client
 */

import { SimpleNode } from "./network/SimpleNode";
import { GetHeadersMessage } from "./network/GetHeadersMessage";
import { decodeAddress } from "./util/Address";
import { BloomFilter } from "./BloomFilter";
import { FilterLoadMessage } from "./network/FilterLoadMessage";
import { GetDataMessage } from "./network/GetDataMessage";
import { InventoryType } from "./InventoryType";
import { MerkleBlock } from "./MerkleBlock";
import { Tx } from "./Tx";
import { HeadersMessage } from "./network/HeadersMessage";

const host: string = "testnet.programmingbitcoin.com";
const testnet: boolean = true;

const bloomFilter: BloomFilter = new BloomFilter(30n, 5n, 90210n);
const startBlock = Buffer.from("00000000000538d5c2246336644f9a4956551afb44ba47278759ec55ea912e19", "hex"); // prettier-ignore
const address = "mwJn1YPMq7y5F8J3LkC5Hxg9PHyZ5K4cFv";
const foundTxs: [Tx, number][] = [];

// construct our testnet node
const node = new SimpleNode(host, undefined, testnet, true);

// wait for the handshake to complete, the simple node takes care of this
// process for us. We can start doing cool stuff now.
node.on("handshake_complete", () => {
  // add our address to the bloom filter
  const { hash: h160 } = decodeAddress(address);
  bloomFilter.add(h160);

  // send a filterload message with the constructed bloom filter
  const filterload = new FilterLoadMessage(bloomFilter);
  node.send(filterload);

  // load headers starting at block 1414317. We will use these blocks to
  // look for transactions related to our address.
  const getheaders = new GetHeadersMessage(startBlock);
  node.send(getheaders);
});

// once we receive headers we can construct a getdata command to ask for
// merkleblock messages and transactions that match our bloom filter
node.on("headers", (headers: HeadersMessage) => {
  const getdata = new GetDataMessage();
  for (const block of headers.blocks) {
    // fail if the block header fails proof of work
    // we do not perform other validations, though we could!
    if (!block.checkProofOfWork()) throw new Error("proof of work is invalid");

    // add an inventory record for a filtered_block with the block hash.
    // This will return a merkleblock command that contains any matches
    // (or none) for our address
    getdata.add(InventoryType.FilteredBlock, block.hash());
  }

  // send the getdata command to the remote
  node.send(getdata);
});

// for every merkleblock that we receive, validate that the partial merkletree
// is valid. We could also look in the tree and see if we have any transactions
// of interest.
node.on("merkleblock", (mblock: MerkleBlock) => {
  if (!mblock.isValid()) {
    throw new Error("invalid merkle proof");
  }
});

// any transactions of interest that were included in the merkleblock will
// also be transmitted. We can check if the transaction is a valid match (since
// bloom filters can have false positives) by looking at the scriptPubKey and
// seeing if our address was used!
node.on("tx", (tx: Tx) => {
  for (let i = 0; i < tx.txOuts.length; i++) {
    const txout = tx.txOuts[i];
    if (txout.scriptPubKey.address(testnet) === address) {
      foundTxs.push([tx, i]);
    }
  }
});

// finally, output all of our found transactions
setTimeout(() => {
  for (const [tx, vout] of foundTxs) {
    console.log("node: found tx", tx.id(), vout);
  }
}, 5000);
