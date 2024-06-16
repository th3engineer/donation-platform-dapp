export interface Charity {
  // On-chain
  slug: string;
  owner_pubkey: string;
  recepient_wallet_pda: string;
  created_at: number;

  // Off-chain
  name: string;
  description?: string;
  image_url?: string;
}

export interface GetAllCharitiesResponse {
  campaigns: Charity[];
}

export type PatchCharityDto = Pick<Charity, "slug"> &
  Partial<Pick<Charity, "name" | "description" | "image_url">>;
