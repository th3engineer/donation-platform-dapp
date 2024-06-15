import { makeRequest, queryEndpoint } from "api/system";

interface CampaignApi {
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

type GetActiveCampaignsResponse = {
  campaigns: CampaignApi[];
};

const getActiveCampaigns = queryEndpoint({
  entity: "activeCampaigns",
  queryKey: () => [],
  queryFn: async () =>
    makeRequest<GetActiveCampaignsResponse>({
      method: "GET",
      url: "http://localhost:3001/get-active-campaigns",
    }).then((response) => response.data),
  defaultValue: { campaigns: [] },
});

export { getActiveCampaigns };
