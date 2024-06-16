import { assert } from "chai";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  createMint,
  Account,
  mintTo,
} from "@solana/spl-token";
import { DonationDapp } from "../target/types/donation_dapp";

describe("donation_dapp", () => {
  const charitySlug1 = "give_tap_charity";
  const charitySlug2 = "gift_of_giving";
  const charitySlug3 = "charity_for_children";

  const campaignId1 = "a2345678910";
  const campaignId2 = "b2345678910";
  const campaignId3 = "c2345678910";

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.DonationDapp as Program<DonationDapp>;

  let dataAccount: anchor.web3.PublicKey;
  let payer: anchor.web3.Keypair;
  let donor: anchor.web3.Keypair;
  let donorTokenAccount: Account;
  let associatedTokenAccountAddress: PublicKey;

  before(async () => {
    payer = anchor.web3.Keypair.generate();

    donor = anchor.web3.Keypair.generate();

    const airDroPtx = await provider.connection.requestAirdrop(
      payer.publicKey,
      1_000_000_000
    );

    await provider.connection.confirmTransaction(airDroPtx, "confirmed");

    const mint = await createMint(
      provider.connection,
      payer,
      donor.publicKey,
      null,
      9
    );

    const tx = await provider.connection.requestAirdrop(
      donor.publicKey,
      1_000_000_000
    );
    await provider.connection.confirmTransaction(tx, "confirmed");

    donorTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      donor,
      mint,
      donor.publicKey
    );

    await mintTo(
      provider.connection,
      donor,
      mint,
      donorTokenAccount.address,
      donor,
      1_000_000
    );

    associatedTokenAccountAddress = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      program.programId
    );

    dataAccount = await anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("donation-dapp")],
      program.programId
    )[0];
  });

  it("Initializes the state", async () => {
    await program.methods
      .initialize()
      .accounts({
        signer: payer.publicKey,
        tokenAccPda: associatedTokenAccountAddress,
      })
      .signers([payer])
      .rpc();

    const data = await program.account.data.fetch(dataAccount);
    assert.strictEqual(data.numberOfCharities.toNumber(), 0);
    assert.strictEqual(data.charityPda, null);
    assert.strictEqual(data.owner.toBase58(), program.programId.toBase58());
  });

  it("Can not initialize the state twice", async () => {
    try {
      await program.methods
        .initialize()
        .accounts({
          signer: payer.publicKey,
          tokenAccPda: associatedTokenAccountAddress,
        })
        .signers([payer])
        .rpc();

      assert.fail("Expected an error but didn't get one");
    } catch (err) {}
  });

  it("Creates one charity", async () => {
    const charityPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity"), Buffer.from(charitySlug1)],
      program.programId
    )[0];

    await program.methods
      .createCharity(charitySlug1)
      .accounts({
        data: dataAccount,
        lastCharityPda: null,
        recipientWalletPda: associatedTokenAccountAddress,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    const data = await program.account.data.fetch(dataAccount);

    assert.strictEqual(data.numberOfCharities.toNumber(), 1);
    assert.strictEqual(data.charityPda.toBase58(), charityPda.toBase58());

    const charity = await program.account.charity.fetch(charityPda);
    assert.strictEqual(charity.slug, charitySlug1);

    assert.strictEqual(charity.numberOfCampaigns.toNumber(), 0);
    assert.strictEqual(charity.createdAt.toNumber() > 0, true);
    assert.strictEqual(charity.nextCharityPda, null);
  });

  it("Creates two more charities", async () => {
    const charityPda1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity"), Buffer.from(charitySlug1)],
      program.programId
    )[0];
    const charityPda2 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity"), Buffer.from(charitySlug2)],
      program.programId
    )[0];
    const charityPda3 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity"), Buffer.from(charitySlug3)],
      program.programId
    )[0];

    await program.methods
      .createCharity(charitySlug2)
      .accounts({
        data: dataAccount,
        lastCharityPda: charityPda1,
        payer: payer.publicKey,
        recipientWalletPda: associatedTokenAccountAddress,
      })
      .signers([payer])
      .rpc();

    await program.methods
      .createCharity(charitySlug3)
      .accounts({
        data: dataAccount,
        lastCharityPda: charityPda2,
        payer: payer.publicKey,
        recipientWalletPda: associatedTokenAccountAddress,
      })
      .signers([payer])
      .rpc();

    const data = await program.account.data.fetch(dataAccount);

    assert.strictEqual(data.numberOfCharities.toNumber(), 3);
    assert.strictEqual(data.charityPda.toBase58(), charityPda1.toBase58());

    const charity2 = await program.account.charity.fetch(charityPda2);
    const charity3 = await program.account.charity.fetch(charityPda3);

    assert.strictEqual(charity2.slug, charitySlug2);
    assert.strictEqual(charity2.numberOfCampaigns.toNumber(), 0);
    assert.strictEqual(charity2.createdAt.toNumber() > 0, true);
    assert.strictEqual(
      charity2.nextCharityPda.toBase58(),
      charityPda3.toBase58()
    );

    assert.strictEqual(charity3.slug, charitySlug3);
    assert.strictEqual(charity3.numberOfCampaigns.toNumber(), 0);
    assert.strictEqual(charity3.createdAt.toNumber() > 0, true);
    assert.strictEqual(charity3.nextCharityPda, null);
  });

  it("Creates one campaign", async () => {
    const deadline = new anchor.BN(Date.now() / 1000 + 3600); // 1 hour from now
    const goal = new anchor.BN(1000);

    const data = await program.account.data.fetch(dataAccount);

    const campaignPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId1)],
      program.programId
    )[0];

    await program.methods
      .createCampaign(campaignId1, deadline, goal)
      .accounts({
        charityPda: data.charityPda,
        lastCampaignPda: null,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    const charity = await program.account.charity.fetch(data.charityPda);
    const campaign = await program.account.campaign.fetch(campaignPda);

    assert.strictEqual(charity.numberOfCampaigns.toNumber(), 1);
    assert.strictEqual(
      campaign.charityPda.toBase58(),
      data.charityPda.toBase58()
    );
    assert.strictEqual(campaign.deadline.toNumber(), deadline.toNumber());
    assert.strictEqual(campaign.goal.toNumber(), goal.toNumber());
    assert.strictEqual(campaign.numberOfDonations.toNumber(), 0);
    assert.strictEqual(campaign.createdAt.toNumber() > 0, true);
  });

  it("Creates two more campaigns", async () => {
    const deadline1 = new anchor.BN(Date.now() / 1000 + 3600); // 1 hour from now
    const deadline2 = new anchor.BN(Date.now() / 1000 + 7200); // 2 hours from now

    const data = await program.account.data.fetch(dataAccount);

    const campaignPda1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId1)],
      program.programId
    )[0];
    const campaignPda2 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId2)],
      program.programId
    )[0];
    const campaignPda3 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId3)],
      program.programId
    )[0];

    await program.methods
      .createCampaign(campaignId2, deadline1, new anchor.BN(2000))
      .accounts({
        charityPda: data.charityPda,
        lastCampaignPda: campaignPda1,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    await program.methods
      .createCampaign(campaignId3, deadline2, new anchor.BN(3000))
      .accounts({
        charityPda: data.charityPda,
        lastCampaignPda: campaignPda2,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    const campaign2 = await program.account.campaign.fetch(campaignPda2);

    const charity = await program.account.charity.fetch(data.charityPda);

    assert.strictEqual(charity.numberOfCampaigns.toNumber(), 3);
    assert.strictEqual(
      campaign2.charityPda.toBase58(),
      data.charityPda.toBase58()
    );
    assert.strictEqual(campaign2.deadline.toNumber(), deadline1.toNumber());
    assert.strictEqual(campaign2.goal.toNumber(), 2000);
    assert.strictEqual(campaign2.numberOfDonations.toNumber(), 0);
    assert.strictEqual(campaign2.createdAt.toNumber() > 0, true);
    assert.strictEqual(
      campaign2.nextCampaignPda.toBase58(),
      campaignPda3.toBase58()
    );
  });

  it("Fails to create a charity with non-ASCII slug", async () => {
    try {
      const charityPda3 = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("charity"), Buffer.from(charitySlug3)],
        program.programId
      )[0];

      const invalidSlug = "slug_with_ñ";

      await program.methods
        .createCharity(invalidSlug)
        .accounts({
          data: dataAccount,
          lastCharityPda: charityPda3,
          payer: payer.publicKey,
          recipientWalletPda: associatedTokenAccountAddress,
        })
        .signers([payer])
        .rpc();

      assert.fail("Expected an error but didn't get one");
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        "Slug must be ASCII characters only."
      );
    }
  });

  it("Donates to a last campaign", async () => {
    const amount = 500;

    const lastCampaignPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId3)],
      program.programId
    )[0];

    const newDonationId = "d2345678910";

    await program.methods
      .donate(newDonationId, new anchor.BN(amount))
      .accounts({
        signer: donor.publicKey,
        donorWalletPda: donorTokenAccount.address,
        campaignPda: lastCampaignPda,
        recipientWalletPda: associatedTokenAccountAddress,
        tokenAccPda: associatedTokenAccountAddress,
        lastDonation: null,
      })
      .signers([donor])
      .rpc();

    const campaign = await program.account.campaign.fetch(lastCampaignPda);

    assert.strictEqual(campaign.collected.toNumber(), amount);
    assert.strictEqual(campaign.numberOfDonations.toNumber(), 1);
  });

  it("Fails to donate if deadline has passed", async () => {
    const amount = 500;

    const deadlineCampaignId = "d2345678910";
    const lastCampaignPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId3)],
      program.programId
    )[0];

    // Create a campaign with past deadline
    const deadline = new anchor.BN(Date.now() / 1000 - 3600); // 1 hour ago
    const goal = new anchor.BN(1000);

    const data = await program.account.data.fetch(dataAccount);

    await program.methods
      .createCampaign(deadlineCampaignId, deadline, goal)
      .accounts({
        charityPda: data.charityPda,
        lastCampaignPda: lastCampaignPda,
        payer: payer.publicKey,
      })
      .signers([payer])
      .rpc();

    const deadlineCampaignPda = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(deadlineCampaignId)],
      program.programId
    )[0];

    try {
      const lastDonationId = "d2345678910";
      const newDonationId = "d2342622210";

      const lastDonationPda = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("donation"), Buffer.from(lastDonationId)],
        program.programId
      )[0];

      await program.methods
        .donate(newDonationId, new anchor.BN(amount))
        .accounts({
          signer: donor.publicKey,
          donorWalletPda: donorTokenAccount.address,
          campaignPda: deadlineCampaignPda,
          recipientWalletPda: associatedTokenAccountAddress,
          tokenAccPda: associatedTokenAccountAddress,
          lastDonation: lastDonationPda,
        })
        .signers([donor])
        .rpc();

      assert.fail("Expected an error but didn't get one");
    } catch (err) {
      assert.strictEqual(
        err.error.errorMessage,
        "Deadline must be in the future."
      );
    }
  });

  it("Refunds a donation", async () => {
    const amount = 500;

    const charityPda1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity"), Buffer.from(charitySlug1)],
      program.programId
    )[0];

    const campaignPda1 = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("charity_campaign"), Buffer.from(campaignId1)],
      program.programId
    )[0];

    const lastDonationId = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("donation"), Buffer.from("d2345678910")],
      program.programId
    )[0];

    await program.methods
      .donate("don12on1234", new anchor.BN(amount))
      .accounts({
        signer: donor.publicKey,
        donorWalletPda: donorTokenAccount.address,
        campaignPda: campaignPda1,
        recipientWalletPda: associatedTokenAccountAddress,
        tokenAccPda: associatedTokenAccountAddress,
        lastDonation: lastDonationId,
      })
      .signers([donor])
      .rpc();

    const latestDonation = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("donation"), Buffer.from("don12on1234")],
      program.programId
    )[0];

    await program.methods
      .cancelCampaign()
      .accounts({
        signer: payer.publicKey,
        campaignPda: campaignPda1,
        charityPda: charityPda1,
      })
      .signers([payer])
      .rpc();
  });
});
