import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTheme } from "@mui/material/styles";

const Header = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "#fff",
        color: theme.palette.grey[700],
        // boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        boxShadow: "none",
        borderBottom: "1px solid rgb(234, 234, 234)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2, ml: -1 }}
          >
            <MenuIcon />
          </IconButton>
          {!isMobile && (
            <Typography variant="h6" color="primary">
              Lab Inventory
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton size="small">
            <HelpOutlineIcon fontSize="large" sx={{ width: 24, height: 24 }} />
          </IconButton>
          <IconButton size="small">
            <NotificationsIcon
              fontSize="large"
              sx={{ width: 24, height: 24 }}
            />
          </IconButton>
          <IconButton size="small">
            <Avatar
              sx={{ width: 35, height: 35, bgcolor: "#e6f1fd" }}
              alt="Remy Sharp"
            ></Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
