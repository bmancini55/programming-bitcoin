/**
 * Marks transaction as invalid. Since bitcoin 0.9, a standard way of
 * attaching extra data to transactions is to add a zero-value output
 * with a scriptPubKey consisting of OP_RETURN followed by data. Such
 * outputs are provably unspendable and specially discarded from
 * storage in the UTXO set, reducing their cost to the network.
 *
 * Since 0.12, standard relay rules allow a single output with OP_RETURN,
 * that contains any sequence of push statements (or OP_RESERVED[1])
 * after the OP_RETURN provided the total scriptPubKey length is at most
 * 83 bytes.
 * @param stack
 */
export function opReturn(stack: Buffer[]): boolean {
  return false;
}
