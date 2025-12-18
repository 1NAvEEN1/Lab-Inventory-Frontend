import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import InventoryIcon from "@mui/icons-material/Inventory";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const navItems = [
  { text: "Dashboard", icon: <InboxIcon />, route: "/dashboard" },
  {
    text: "Inventory",
    icon: <InventoryIcon />,
    children: [
      { text: "Items", route: "/inventory/items" },
      { text: "Categories", route: "/inventory/categories" },
      { text: "Locations", route: "/inventory/locations" },
    ],
  },
  // { text: "Invite Teammate", icon: <GroupIcon />, route: "/invite" },
  {
    text: "Settings",
    icon: <SettingsIcon />,
    route: "/settings",
    // children: [
    //   { text: "Team", route: "/settings/team" },
    //   { text: "Members", route: "/settings/members" },
    //   { text: "Notifications", route: "/settings/notifications" },
    //   { text: "Integrations & API", route: "/settings/integrations" },
    //   { text: "Billing", route: "/settings/billing" },
    // ],
  },
  // { text: "Logout", icon: <LogoutIcon />, route: "/logout" },
];

const DrawerMenu = ({ open, setOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedMenus, setExpandedMenus] = useState({
    Settings: currentPath.startsWith("/settings"),
    Inventory: currentPath.startsWith("/inventory"),
  });

  const handleExpandToggle = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (route) =>
    currentPath === route || currentPath.startsWith(route + "/");

  const isParentActive = (route, children) => {
    if (route) return isActive(route);
    if (children && Array.isArray(children)) {
      return children.some(({ route: childRoute }) => isActive(childRoute));
    }
    return false;
  };

  // Collapse all child menus when drawer is closed
  useEffect(() => {
    if (!open) {
      const collapsed = {};
      navItems.forEach(({ text, children }) => {
        if (children) collapsed[text] = false;
      });
      setExpandedMenus(collapsed);
    }
  }, [open]);

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 64,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 64,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Box
        display="flex"
        justifyContent={open ? "flex-end" : "center"}
        alignItems="center"
        p={1}
      >
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ paddingX: 1, mt: 3 }}>
        {navItems.map(({ text, icon, route, children }) => (
          <React.Fragment key={text}>
            <Tooltip title={!open ? text : ""} placement="right">
              <ListItem
                button
                onClick={() => {
                  if (children) {
                    const firstChildRoute = children[0]?.route;
                    if (firstChildRoute) navigate(firstChildRoute);
                  } else if (route) {
                    navigate(route);
                  }
                }}
                selected={isParentActive(route, children)}
                sx={{
                  minWidth: "fit-content",
                  minHeight: 37,
                  bgcolor: isParentActive(route, children)
                    ? "#e6f1fd"
                    : "inherit",
                  color: isParentActive(route, children)
                    ? "primary.main"
                    : theme.palette.grey[700],
                  borderRadius: 5,
                  mb: 1,
                  "&:hover": {
                    bgcolor: isParentActive(route, children)
                      ? "#e6f1fd"
                      : theme.palette.grey[200],
                    cursor: "pointer",
                  },
                  py: 0,
                  pl: 1.7,
                  pr: open ? 0.9 : 0,
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.grey[500] }}>
                  {icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: "14px",
                        fontWeight: 500,
                      },
                    }}
                  />
                )}
                {children && open && (
                  <IconButton
                    size="small"
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandToggle(text);
                    }}
                  >
                    {expandedMenus[text] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </ListItem>
            </Tooltip>

            {/* Sub-navigation */}
            {children && (
              <Collapse in={expandedMenus[text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {children.map(({ text: childText, route: childRoute }) => (
                    <Box pl={2}>
                      <ListItem
                        key={childText}
                        button
                        onClick={() => navigate(childRoute)}
                        selected={currentPath === childRoute}
                        sx={{
                          // pl: open ? 4 : 2,
                          minHeight: 36,
                          bgcolor:
                            currentPath === childRoute ? "#e6f1fd" : "inherit",
                          color:
                            currentPath === childRoute
                              ? "primary.main"
                              : theme.palette.grey[700],
                          borderRadius: 3,
                          mb: 0.5,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor:
                              currentPath === childRoute
                                ? "#e6f1fd"
                                : theme.palette.grey[100],
                          },
                          py: 0,
                        }}
                      >
                        {open && (
                          <ListItemText
                            primary={childText}
                            sx={{
                              "& .MuiListItemText-primary": {
                                fontSize: "14px",
                              },
                            }}
                          />
                        )}
                        {!open && (
                          <Tooltip title={childText} placement="right">
                            <Box width="100%" />
                          </Tooltip>
                        )}
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default DrawerMenu;
