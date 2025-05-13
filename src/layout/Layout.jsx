import React, { useState } from "react";
import { Box } from "@mui/material";
import Header from "./Header";
import DrawerMenu from "./DrawerMenu";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [open, setOpen] = useState(true);

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <DrawerMenu open={open} setOpen={setOpen} />
      <Header open={open} setOpen={setOpen} />
      {/* Main content area */}
      <Box
        flexGrow={1}
        sx={{
          bgcolor: "#f4f4f4",
          overflow: "auto",
          mt: { xs: "56px", sm: "64px" },
        }}
      >
        <Box
          p={2}
          sx={{
            bgcolor: "#fff",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
