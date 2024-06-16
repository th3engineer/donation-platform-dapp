export interface Donation {
  // From on-chain
  donation_id: string;
  donor_wallet_pubkey: string;
  donor_wallet_pda: string;
  amount: number;
  is_refunded: boolean;
  campaign_id: string;
  created_at: number;

  // Off-chain
  recepient_wallet_pda: string;
  user_id: string;
}
