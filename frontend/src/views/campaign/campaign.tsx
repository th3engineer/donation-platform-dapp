import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";

import { campaignApi } from "api";
import { Page, Header } from "components";

import {
  CampaignTitle,
  CampaignImage,
  CampaignDescription,
  CampaignDetail,
} from "./campaign.styled";

const Campaign = () => {
  const router = useRouter();
  const campaignId = router.query.campaignId as string;
  const { campaign } = campaignApi.getCampaign.useQuery({
    campaignId,
  });

  const { connected } = useWallet();

  const {
    donations: { donations },
  } = campaignApi.getCampaignDonations.useQuery({ campaignId });

  if (!campaign) {
    return <Page>No campaign found!</Page>;
  }

  return (
    <Page>
      <Header />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 0",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "flex-start", columnGap: "32px" }}
        >
          <Box
            sx={{
              boxShadow: "0px 0px 48px 0px rgba(0, 0, 0, 0.25)",
              padding: "20px",
            }}
          >
            <CampaignTitle variant="h5">{campaign.name}</CampaignTitle>
            <CampaignImage src={campaign.imageUrl} alt={campaign.name} />
            <CampaignDescription variant="body1" paragraph>
              {campaign.description}
            </CampaignDescription>
            <CampaignDetail variant="body2">
              Goal: ${campaign.goal.toLocaleString()}
            </CampaignDetail>
            <CampaignDetail variant="body2">
              Collected: ${campaign.collected.toLocaleString()}
            </CampaignDetail>
            <CampaignDetail variant="body2">
              Deadline: {new Date(campaign.deadline).toDateString()}
            </CampaignDetail>
            <CampaignDetail variant="body2">
              Status: {campaign.status}
            </CampaignDetail>
            <CampaignDetail variant="body2">
              Charity: {campaign.charity_slug}
            </CampaignDetail>
            <CampaignDetail sx={{ marginBottom: "24px" }} variant="caption">
              Created at: {new Date(campaign.created_at).toDateString()}
            </CampaignDetail>
            <Button
              sx={{ marginLeft: "auto", display: "block" }}
              variant="contained"
              disabled={!connected}
            >
              Donate
            </Button>
          </Box>
          <Box
            sx={{
              boxShadow: "0px 0px 48px 0px rgba(0, 0, 0, 0.25)",
              padding: "20px",
            }}
          >
            <Typography variant="h5" sx={{ marginBottom: "16px" }}>
              Latest donations
            </Typography>
            <Box>
              {donations.map((donation) => (
                <Typography key={donation.donation_id}>
                  $ {donation.amount}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default Campaign;
