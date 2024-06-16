import React, { useEffect } from "react";
import { AppBar, Box, Button, Typography } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import { Logout } from "@mui/icons-material";

const Header = () => {
  const { select, connected, connect, disconnect, publicKey } = useWallet();

  useEffect(() => {
    select(PhantomWalletName);
  }, [select]);

  const handleConnectClick = () => {
    connect().catch((err) => console.error(err));
  };

  return (
    <AppBar
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: "16px 24px",
        minHeight: "95px",
      }}
      position="static"
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography display="block" variant="h6" color="inherit" noWrap>
            Open Charities Protocol
          </Typography>
          <Typography variant="body2" color="inherit" noWrap>
            Version 0.0.1
          </Typography>
        </Box>
        <Box sx={{ marginLeft: "auto" }}>
          {connected ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              <Typography variant="caption">{publicKey!.toString()}</Typography>
              <Button
                size="small"
                color="error"
                variant="contained"
                onClick={disconnect}
                endIcon={<Logout />}
              >
                Disconnect
              </Button>
            </Box>
          ) : (
            <Button
              onClick={handleConnectClick}
              variant="contained"
              color="success"
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>
    </AppBar>
  );
};

export default Header;
