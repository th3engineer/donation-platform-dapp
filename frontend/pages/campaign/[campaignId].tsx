import { GetServerSideProps } from "next";
import { QueryClient, dehydrate } from "@tanstack/react-query";

import { Campaign } from "views";
import { campaignApi } from "api";

const CampaignPage = () => {
  return <Campaign />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { campaignId } = context.params as { campaignId: string };

  const queryClient = new QueryClient();

  await Promise.all([
    campaignApi.getCampaign.prefetch(queryClient, { campaignId }),
    campaignApi.getCampaignDonations.prefetch(queryClient, { campaignId }),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return {
    props: {
      dehydratedState,
    },
  };
};

export default CampaignPage;
