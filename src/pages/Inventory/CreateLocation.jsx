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
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import LocationsService from "../../services/locationsService";
import { showAlertMessage } from "../../app/alertMessageController";
import ParentLocationSelector from "../../components/ParentLocationSelector";
import AttributesInput from "../../components/AttributesInput";

const CreateLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: viewId } = useParams();
  const editId = searchParams.get("edit");
  const parentId = searchParams.get("parent");

  // Determine the mode: view, edit, or create
  const isViewMode = Boolean(viewId);
  const isEditMode = Boolean(editId);
  const isCreateMode = !isViewMode && !isEditMode;

  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [parentLocationId, setParentLocationId] = useState(null);

  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const locationId = viewId || editId;
    if (locationId) {
      fetchLocation(locationId);
    }
  }, [viewId, editId]);

  // Set parent location when parent parameter is provided
  useEffect(() => {
    if (parentId && isCreateMode) {
      setParentLocationId(String(parentId));
    }
  }, [parentId, isCreateMode]);

  const fetchLocation = async (locationId) => {
    try {
      setLoading(true);
      const response = await LocationsService.getById(locationId);
      const location = response.data;
      setLocationName(location.name || "");
      setDescription(location.description || "");

      const apiParentId = location?.parentId;
      setParentLocationId(apiParentId !== null ? String(apiParentId) : null);
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
        // Convert parentLocationId (string|null) back to number or null for API
        parentId:
          parentLocationId === null || parentLocationId === ""
            ? null
            : Number(parentLocationId),
        attributes: attributes, // This is now a plain object from AttributesInput
      };

      console.log("Saving with payload:", payload);

      if (isEditMode) {
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
        message: isEditMode
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

  const handleEdit = () => {
    navigate(`/inventory/locations/add-location?edit=${viewId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      setLoading(true);
      await LocationsService.delete(viewId);
      showAlertMessage({
        message: "Location deleted successfully",
        type: "success",
      });
      navigate("/inventory/locations");
    } catch (err) {
      showAlertMessage({
        message: "Failed to delete location",
        type: "error",
      });
      console.error("Error deleting location:", err);
    } finally {
      setLoading(false);
    }
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
          size="small"
        >
          Back
        </Button>
        <Typography variant="h6" gutterBottom>
          {isViewMode
            ? "View Location"
            : isEditMode
            ? "Edit Location"
            : "Create Location"}
        </Typography>
        {isViewMode && (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              disabled={loading}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          </Stack>
        )}
        {!isViewMode && <div></div>}
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
                  disabled={isViewMode}
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Parent Location</Typography>
                <ParentLocationSelector
                  value={parentLocationId}
                  onChange={setParentLocationId}
                  disabled={loading || isViewMode}
                />
              </Box>

              <Box>
                <AttributesInput
                  value={attributes}
                  onChange={setAttributes}
                  disabled={loading || isViewMode}
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
                  disabled={isViewMode}
                />
              </Box>
            </Stack>
          </Box>

          {!isViewMode && (
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
                    : isEditMode
                    ? "Update Location"
                    : "Save Location"}
                </Button>
              </div>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CreateLocation;
