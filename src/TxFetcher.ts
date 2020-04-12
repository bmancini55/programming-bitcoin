import url from "url";
import http from "http";
import { Duplex } from "stream";
import { Tx } from "./Tx";
import { combine, bufToStream } from "./util/BufferUtil";

export class TxFetcher {
  public static cache = new Map();

  public static getUrl(testnet: boolean = false) {
    if (testnet) {
      return "http://testnet.programmingbitcoin.com";
    } else {
      return "http://mainnet.programmingbitcoin.com";
    }
  }

  public static async fetch(
    txId: string,
    testnet: boolean = false,
    fresh: boolean = false
  ): Promise<Tx> {
    if (fresh || !TxFetcher.cache.get(txId)) {
      const root = TxFetcher.getUrl(testnet);
      const requrl = `${root}/tx/${txId}.hex`;
      let raw = await httpGet(requrl);

      // temp hack for segwit txs
      if (raw[4] === 0x00) {
        raw = combine(raw.slice(0, 4), raw.slice(6));
      }

      // convert buffer to stream
      const stream = bufToStream(raw);

      // parse and set the tx
      const tx = await Tx.parse(stream);
      tx.testnet = testnet;
      TxFetcher.cache.set(txId, tx);
    }
    return TxFetcher.cache.get(txId);
  }
}

async function httpGet(requrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = http.request({ method: "GET", ...url.parse(requrl) }, res => {
      const bufs = [];
      res.on("data", buf => bufs.push(buf.toString()));
      res.on("end", () => {
        const body = bufs.join();
        if (res.statusCode === 200) resolve(Buffer.from(body, "hex"));
        else {
          reject(
            new Error(
              `Failed with statusCode ${res.statusCode} and body ${body}`
            )
          );
        }
      });
    });
    req.on("error", err => reject(err));
    req.end();
  });
}
