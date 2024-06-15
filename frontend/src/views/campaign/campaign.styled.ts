import { styled, Typography } from "@mui/material";

export const CampaignTitle = styled(Typography)({
  marginBottom: "20px",
  fontWeight: "bold",
});

export const CampaignImage = styled("img")({
  width: "100%",
  height: "auto",
  borderRadius: "8px",
  marginBottom: "20px",
});

export const CampaignDescription = styled(Typography)({
  marginBottom: "20px",
  lineHeight: 1.6,
});

export const CampaignDetail = styled(Typography)({
  marginBottom: "10px",
  fontSize: "16px",
});
