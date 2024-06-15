import { makeRequest, queryEndpoint } from "api/system";

interface GetCampaignResponse {
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

interface Donation {
  // From on-chain
  donation_id: string;
  donor_wallet_pubkey: string;
  donor_wallet_pda: string;
  campaign_pda: string;
  amount: string;
  is_refunded: string;
  created_at: number;

  // Off-chain
  recepient_wallet_pda: string;
}

type GetCampaignDonationsResponse = {
  donations: Donation[];
};

const getCampaign = queryEndpoint({
  entity: "campaign",
  queryKey: ({ campaignId }: { campaignId: string }) => [
    "campaign",
    campaignId,
  ],
  queryFn: async ({ campaignId }: { campaignId: string }) =>
    makeRequest<GetCampaignResponse>({
      method: "GET",
      url: `http://localhost:3001/campaign/${campaignId}`,
    }).then((response) => response.data),
  defaultValue: null,
  nullable: true,
});

const getCampaignDonations = queryEndpoint({
  entity: "donations",
  queryKey: ({ campaignId }: { campaignId: string }) => [
    "donations",
    campaignId,
  ],
  queryFn: async ({ campaignId }: { campaignId: string }) =>
    makeRequest<GetCampaignDonationsResponse>({
      method: "GET",
      url: `http://localhost:3001/campaign/${campaignId}/latest-donations`,
    }).then((response) => response.data),
  defaultValue: { donations: [] },
});

export { getCampaign, getCampaignDonations };
