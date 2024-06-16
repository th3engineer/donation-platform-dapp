import React from "react";
import { Box, SxProps, Typography } from "@mui/material";

interface CurrentCollectedProps {
  sx?: SxProps;
  goal: number;
  collected: number;
}

const CurrentCollected = ({ sx, goal, collected }: CurrentCollectedProps) => {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h3" color="primary">
        {collected} USDC
      </Typography>
      <Typography variant="caption">collected from {goal} USDC goal</Typography>
    </Box>
  );
};

export default CurrentCollected;

