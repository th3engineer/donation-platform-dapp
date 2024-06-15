import { ScanCommand } from "@aws-sdk/lib-dynamodb";

import { docClient } from "../dynamodb";

export interface Donation {
  // From on-chain
  donation_id: string;
  donor_wallet_pubkey: string;
  donor_wallet_pda: string;
  amount: string;
  is_refunded: string;
  created_at: string;

  // Of-chain
  recepient_wallet_pda: string;
}

export const getAllDonations = async () => {
  try {
    const params = {
      TableName: "Donations",
    };

    const data = await docClient.send(new ScanCommand(params));

    return (data.Items || []) as Donation[];
  } catch (err) {
    console.error("Error retrieving item:", err);
    throw err;
  }
};
