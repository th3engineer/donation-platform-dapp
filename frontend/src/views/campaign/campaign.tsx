import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { format } from "date-fns";

import { campaignApi } from "api";
import { Page, Header } from "components";
import { shortenPubkey } from "utils/shorten-pubkey";

import ProgressBar from "./progress-bar";
import CurrentCollected from "./current-collected";
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

  const details: Array<{ key: string; value: string }> = [
    {
      key: "Deadline",
      value: campaign.deadline,
    },
    {
      key: "Charity",
      value: campaign.charity_slug,
    },
    {
      key: "Created at",
      value: format(campaign.created_at, "MMM dd, yyyy h:mm:ss"),
    },
  ];

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
          sx={{
            flex: 2,
            display: "flex",
            alignItems: "flex-start",
            columnGap: "32px",
          }}
        >
          <Box
            sx={{
              boxShadow: "0px 0px 48px 0px rgba(0, 0, 0, 0.25)",
              padding: "20px",
            }}
          >
            <ProgressBar
              sx={{ marginBottom: "24px" }}
              goal={campaign.goal}
              collected={campaign.collected}
            />
            <CurrentCollected
              sx={{ marginBottom: "24px" }}
              goal={campaign.goal}
              collected={campaign.collected}
            />
            <CampaignTitle variant="h5">{campaign.name}</CampaignTitle>
            <CampaignImage src={campaign.imageUrl} alt={campaign.name} />
            <CampaignDescription variant="body1" paragraph>
              {campaign.description}
            </CampaignDescription>
            {details.map((d) => (
              <CampaignDetail variant="body2">
                {d.key}: {d.value}
              </CampaignDetail>
            ))}
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
              flex: 1,
              width: "35%",
              boxShadow: "0px 0px 48px 0px rgba(0, 0, 0, 0.25)",
              padding: "20px",
            }}
          >
            <Typography variant="h5" sx={{ marginBottom: "16px" }}>
              Latest donations
            </Typography>
            <Box>
              {donations.map((donation) => (
                <Box
                  key={donation.donation_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <Typography
                    sx={{ color: (theme) => theme.palette.success.main }}
                    variant="caption"
                    color="success"
                  >
                    +{donation.amount} USDC
                  </Typography>
                  <Typography variant="caption">
                    {shortenPubkey(donation.donor_wallet_pda)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default Campaign;
