import { SimpleNode } from "./network/SimpleNode";

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
