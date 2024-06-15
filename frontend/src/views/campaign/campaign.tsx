import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import { Box, Button, styled } from "@mui/material";

import { campaignApi } from "api";
import { Page } from "components";

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

  const {
    donations: { donations },
  } = campaignApi.getCampaignDonations.useQuery({ campaignId });

  if (!campaign) {
    return <Page>No campaign found!</Page>;
  }

  return (
    <Page>
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 64px)",
          alignItems: "center",
          justifyContent: "center",
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
            <CampaignDetail variant="caption">
              Created at: {new Date(campaign.created_at).toDateString()}
            </CampaignDetail>
            <Button
              sx={{ marginTop: "40px", marginLeft: "auto", display: "block" }}
              variant="contained"
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
