import { Box } from "@mui/material";
import React from "react";

interface PageProps {
  children: React.ReactNode;
}

const Page = ({ children }: PageProps) => {
  return (
    <Box sx={{ paddingTop: "32px" }}>
      <Box
        sx={{
          maxWidth: "1100px",
          width: "100%",
          padding: "0 16px",
          margin: "0 auto",
        }}
      >
        <Box sx={{ borderRadius: "8px" }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Page;
