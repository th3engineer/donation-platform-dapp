export const shortenPubkey = (pubkey: string) =>
  pubkey.slice(0, 4) + "..." + pubkey.slice(pubkey.length - 4, pubkey.length);
