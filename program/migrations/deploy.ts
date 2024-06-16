// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { getAssociatedTokenAddress } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { DonationDapp } from "../target/types/donation_dapp";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

const toUint8Array = (text: string) =>
  Uint8Array.from(text.split("").map((letter) => letter.charCodeAt(0)));

module.exports = async function (provider: anchor.AnchorProvider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  const MINT = new anchor.web3.PublicKey(
    // USDC
    "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
  );
  const associatedTokenAccountAddress = await getAssociatedTokenAddress(
    MINT,
    provider.wallet.publicKey
  );
  const program = anchor.workspace.DonationDapp as Program<DonationDapp>;
  program.methods
    .initialize()
    .accounts({
      tokenAccPda: associatedTokenAccountAddress,
    })
    .signers([
      Keypair.fromSecretKey(
        toUint8Array(
          // temp pk from dev network, env var should be used
          "4GTYKPMG3DYDZHwrJxKUvtNNjr3xYwVm94TdHDTJL2iroXxFnPyMbkBk7di81eVkVhgRhbxe3ZqJzuinXsQwHXmC"
        )
      ),
    ])
    .rpc();
};
