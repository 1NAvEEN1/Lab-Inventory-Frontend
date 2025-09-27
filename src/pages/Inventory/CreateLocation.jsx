import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import LocationsService from "../../services/locationsService";
import { showAlertMessage } from "../../app/alertMessageController";
import ParentLocationSelector from "../../components/ParentLocationSelector";
import AttributesInput from "../../components/AttributesInput";

const CreateLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [parentLocationId, setParentLocationId] = useState(null);
  
  // Debug parent location changes
  useEffect(() => {
    console.log("CreateLocation parentLocationId changed:", parentLocationId);
  }, [parentLocationId]);
  const [attributes, setAttributes] = useState({});
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
      setParentLocationId(location.parentLocationId || null);
      setAttributes(location.attributes || {});
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
        parentId: parentLocationId,
        attributes: attributes, // This is now a plain object from AttributesInput
      };
      
      console.log("Saving with payload:", payload);

      if (editId) {
        await LocationsService.update(editId, payload);
        showAlertMessage({
          message: "Location updated successfully",
          type: "success",
        });
      } else {
        await LocationsService.save(payload);
        showAlertMessage({
          message: "Location created successfully",
          type: "success",
        });
      }

      navigate("/inventory/locations");
    } catch (err) {
      showAlertMessage({
        message: editId
          ? "Failed to update location"
          : "Failed to create location",
        type: "error",
      });
      console.error("Error saving location:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLocationName("");
    setDescription("");
    setParentLocationId(null);
    setAttributes({});
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/locations")}
          color="primary"
        >
          Back
        </Button>
        <Typography variant="h6" gutterBottom>
          {editId ? "Edit Location" : "Create Location"}
        </Typography>
        <div></div>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Box display={"flex"} justifyContent={"center"}>
        <Box width={"700px"}>
          <Box sx={{ mb: 3, maxWidth: "700px" }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ mb: 0.5 }}>
                  Location Name <span style={{ color: "red" }}>*</span>
                </Typography>
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
                <Typography sx={{ mb: 0.5 }}>Parent Location</Typography>
                <ParentLocationSelector
                  value={parentLocationId}
                  onChange={setParentLocationId}
                  disabled={loading}
                />
              </Box>

              <Box>
                <AttributesInput
                  value={attributes}
                  onChange={setAttributes}
                  disabled={loading}
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
                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Location"
                  : "Save Location"}
              </Button>
            </div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateLocation;
