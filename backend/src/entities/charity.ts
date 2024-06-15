export interface CharityEntity {
  // On-chain
  slug: string;
  owner_pubkey: string;
  recepient_wallet_pda: string;
  created_at: number;

  // Off-chain
  name: string;
  description: string;
  imageUrl: string;
}
