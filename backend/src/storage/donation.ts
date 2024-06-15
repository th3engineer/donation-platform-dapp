import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { docClient } from "../dynamodb";

export interface Donation {
  // From on-chain
  donation_id: string;
  donor_wallet_pubkey: string;
  donor_wallet_pda: string;
  amount: string;
  is_refunded: string;
  created_at: number;

  // Of-chain
  recepient_wallet_pda: string;
  campaign_id: string;
  user_id: string;
}

const donations: Donation[] = Array.from<Donation>({ length: 125 }).map<Donation>((_, index) => ({
  donation_id: `don_${index + 1}`,
  donor_wallet_pubkey: `pubkey_donor_${index + 1}`,
  donor_wallet_pda: `pda_donor_${index + 1}`,
  amount: (Math.random() * 1000 + 50).toFixed(2), // Random amounts between 50 and 1050
  is_refunded: Math.random() > 0.8 ? 'true' : 'false', // 20% chance of being refunded
  created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).valueOf(),
  recepient_wallet_pda: `pda_recipient_${index + 1}`,
  campaign_id: `cmp_${index % 25 + 1}`, // Assuming there are 25 campaigns
  user_id: `user_${index + 1}`
}));


export const getAllDonations = async () => {
  try {
    const params = {
      TableName: "Donations",
    };

    return donations;

    // const data = await docClient.send(new ScanCommand(params));

    // return (data.Items || []) as Donation[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
