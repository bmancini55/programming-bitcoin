import url from "url";
import https from "https";
import { Duplex } from "stream";
import { Tx } from "./Tx";
import { combine, bufToStream } from "./util/BufferUtil";

export class TxFetcher {
  public static cache = new Map();

  public static async fetch(
    txId: string,
    testnet: boolean = false,
    fresh: boolean = false
  ): Promise<Tx> {
    if (fresh || !TxFetcher.cache.get(txId)) {
      const requrl = testnet
        ? `https://blockstream.info/testnet/api/tx/${txId}/hex`
        : `https://blockstream.info/api/tx/${txId}/hex`;

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
    const req = https.request({ method: "GET", ...url.parse(requrl) }, res => {
      const bufs = [];
      res.on("data", buf => bufs.push(buf.toString()));
      res.on("end", () => {
        const body = bufs.join("");
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
