import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../reducers/authSlice";
import { showAlertMessage } from "../app/alertMessageController";

const Header = ({ open, setOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    // Navigate to profile page
    navigate("/profile");
  };

  const handleLogout = () => {
    handleClose();
    dispatch(clearAuth());
    showAlertMessage({ message: "Logged out successfully", type: "success" });
    navigate("/login");
  };

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
          <IconButton
            size="small"
            onClick={handleProfileClick}
            aria-controls={openMenu ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? "true" : undefined}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: "#e6f1fd",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#d1e7fd",
                },
              }}
              alt={user?.First_Name || "User"}
            >
              {user?.First_Name?.charAt(0) || "U"}
            </Avatar>
          </IconButton>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1,
                minWidth: 120,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 19,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleProfile} sx={{ height: 25 }}>
              <ListItemIcon sx={{ mr: 0 }}>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ height: 25 }}>
              <ListItemIcon sx={{ mr: 0 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
