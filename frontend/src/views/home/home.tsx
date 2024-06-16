import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { homeApi } from "api";
import { Page, Header } from "components";

const Home = () => {
  const { campaings } = homeApi.getCampaigns.useQuery(null);

  return (
    <Page>
      <Header />
      <Box sx={{ padding: "32px 0" }}>
        <Typography variant="h5" sx={{ marginBottom: "16px" }}>
          Latest campaigns
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
          }}
        >
          {campaings.campaigns.map((campaign) => (
            <Box
              sx={{
                padding: "16px 24px",
                boxShadow: "0px 0px 48px 0px rgba(0, 0, 0, 0.08)",
                background: (theme) => theme.palette.background.paper,
              }}
              key={campaign.campaign_id}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-center",
                  marginBottom: "16px",
                }}
              >
                <Typography variant="body1">{campaign.name}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(0,0,0,.5)",
                    fontSize: "12px",
                    lineHeight: "14px",
                  }}
                >
                  {campaign.campaign_id}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ marginBottom: "16px" }}>
                {campaign.description}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="overline">
                  Goal: {campaign.collected} / {campaign.goal}
                </Typography>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  href={`/campaign/${campaign.campaign_id}`}
                  target="_parent"
                >
                  See full campaign
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
};

export default Home;
