import { Keypair } from "@solana/web3.js";

export const privateKeyString =
  "4GTYKPMG3DYDZHwrJxKUvtNNjr3xYwVm94TdHDTJL2iroXxFnPyMbkBk7di81eVkVhgRhbxe3ZqJzuinXsQwHXmC";

const toUint8Array = (text: string) =>
  Uint8Array.from(text.split("").map((letter) => letter.charCodeAt(0)));

describe("donation_dapp", () => {
  it("Initializes the state", async () => {
    console.log(Keypair.fromSecretKey(toUint8Array(privateKeyString)));
  });
});
