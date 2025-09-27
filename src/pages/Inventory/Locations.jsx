import React from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LocationsTree from "../../components/LocationsTree";

const Locations = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          Locations
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/inventory/locations/add-location")}
          size="small"
        >
          Add Location
        </Button>
      </Stack>

      {/* Locations Tree - modern minimal */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          bgcolor: "#efefef",
          height: { sx: "calc(100vh - 100px)", md: "calc(100vh - 145px)" },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box width={"100%"} maxWidth={"100%"}>
          <LocationsTree
            defaultExpandedIds={[]}
            onView={(id) => handleView(id)}
            onAdd={(id) =>
              navigate(`/inventory/locations/add-location?parent=${id}`)
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Locations;
