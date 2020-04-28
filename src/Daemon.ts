import { SimpleNode } from "./network/SimpleNode";
import { Block } from "./Block";
import { GetHeadersMessage } from "./network/GetHeadersMessage";

let host: string;
let testnet: boolean;

if (process.argv[2] === "testnet") {
  testnet = true;
  host = "testnet.programmingbitcoin.com";
} else {
  testnet = false;
  host = "mainnet.programmingbitcoin.com";
}

const node = new SimpleNode(host, undefined, testnet, true);

node.on("handshake_complete", () => {
  // request headers
  const getheaders = new GetHeadersMessage(node.genesis.hash());
  node.send(getheaders);
});

node.on("headers_received", () => {
  if (node.blocks.length < 10000) {
    const start = node.blocks[node.blocks.length - 1].hash();
    const getheaders = new GetHeadersMessage(start);
    node.send(getheaders);
  }
});
