export interface CampaignEntity {
  // On-chain
  campaign_id: string;
  charity_pda: string;
  deadline: string;
  goal: number;
  collected: number;
  created_at: number;

  // Off-chain
  name: string;
  description: string;
  imageUrl: string;
  status: string;
  charity_slug: string;
}
