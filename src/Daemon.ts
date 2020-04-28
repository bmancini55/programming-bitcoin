import { SimpleNode } from "./network/SimpleNode";
import { Block } from "./Block";
import { GetHeadersMessage } from "./network/GetHeadersMessage";

let host: string;
let testnet: boolean;
let genesis: Block;

if (process.argv[2] === "testnet") {
  testnet = true;
  host = "testnet.programmingbitcoin.com";
  genesis = Block.genesisBlock;
} else {
  testnet = false;
  host = "mainnet.programmingbitcoin.com";
  genesis = Block.testnetGensisBlock;
}

const node = new SimpleNode(host, undefined, testnet, true);

node.on("handshake_complete", () => {
  // request headers
  const getheaders = new GetHeadersMessage(genesis.hash());
  node.send(getheaders);
});
