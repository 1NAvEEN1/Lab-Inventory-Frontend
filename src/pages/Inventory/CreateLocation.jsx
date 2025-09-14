import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import LocationsService from "../../services/locationsService";
import { showAlertMessage } from "../../app/alertMessageController";

const CreateLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchLocation();
    }
  }, [editId]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const response = await LocationsService.getById(editId);
      const location = response.data;
      setLocationName(location.name || "");
      setDescription(location.description || "");
      setAddress(location.address || "");
    } catch (err) {
      showAlertMessage({ message: "Failed to fetch location", type: "error" });
      console.error("Error fetching location:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!locationName.trim()) {
      showAlertMessage({ message: "Location name is required", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: locationName.trim(),
        description: description.trim(),
        address: address.trim(),
      };

      if (editId) {
        await LocationsService.update(editId, payload);
        showAlertMessage({ message: "Location updated successfully", type: "success" });
      } else {
        await LocationsService.save(payload);
        showAlertMessage({ message: "Location created successfully", type: "success" });
      }

      navigate("/inventory/locations");
    } catch (err) {
      showAlertMessage({ 
        message: editId ? "Failed to update location" : "Failed to create location", 
        type: "error" 
      });
      console.error("Error saving location:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLocationName("");
    setDescription("");
    setAddress("");
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/locations")}
          color="primary"
        >
          Back
        </Button>
        <Typography variant="h5" gutterBottom>
          {editId ? "Edit Location" : "Create Location"}
        </Typography>
      </Stack>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box display={"flex"} justifyContent={"center"}>
        <Box width={"700px"}>
          <Box sx={{ mb: 3, maxWidth: "700px" }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ mb: 0.5 }}>Location Name *</Typography>
                <TextField
                  placeholder="Enter location name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  fullWidth
                  size="small"
                  required
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Description</Typography>
                <TextField
                  placeholder="Enter location description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Address</Typography>
                <TextField
                  placeholder="Enter location address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                />
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            mt={5}
            display={"flex"}
            justifyContent={"space-between"}
            maxWidth={"700px"}
            pr={2}
          >
            <Button
              variant="outlined"
              onClick={handleClear}
              color="warning"
              size="small"
              disabled={loading}
            >
              Clear All Data
            </Button>
            <div>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!locationName.trim() || loading}
                size="small"
              >
                {loading ? "Saving..." : editId ? "Update Location" : "Save Location"}
              </Button>
            </div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateLocation;
