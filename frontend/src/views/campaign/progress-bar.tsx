import React from "react";
import { Box, SxProps } from "@mui/material";

interface ProgressBarProps {
  sx?: SxProps;
  goal: number;
  collected: number;
}

const ProgressBar = ({ sx, goal, collected }: ProgressBarProps) => {
  const percentage = Math.min(Math.floor((collected / goal) * 100), 100);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", ...sx }}>
      <Box>{percentage}%</Box>
      <Box
        sx={{
          position: "relative",
          flexGrow: 1,
          height: "6px",
          background: (theme) => theme.palette.grey.A200,

          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: "0",
            left: "0",
            width: `${percentage}%`,
            height: "100%",
            background: (theme) => theme.palette.primary.main,
          },
        }}
      ></Box>
    </Box>
  );
};

export default ProgressBar;
