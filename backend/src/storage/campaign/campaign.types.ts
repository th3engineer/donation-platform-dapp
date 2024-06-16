export interface Campaign {
  // On-chain
  campaign_id: string;
  charity_pda: string;
  deadline: number;
  goal: number;
  collected: number;
  refunded: number;
  is_cancelled: boolean;
  created_at: number;

  // Off-chain
  name: string;
  description?: string;
  image_url?: string;
  charity_slug: string;
}

export interface GetAllCampaignsResponse {
  campaigns: Campaign[];
}

export type PatchCampaignDto = Pick<Campaign, "campaign_id"> &
  Partial<Pick<Campaign, "name" | "description" | "image_url">>;
