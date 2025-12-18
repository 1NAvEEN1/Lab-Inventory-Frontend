import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ParentLocationSelector from "../ParentLocationSelector";

/**
 * Dialog for reassigning items when deleting a location
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Called when dialog is closed
 * @param {Function} props.onConfirm - Called with selected location ID when confirmed
 * @param {string} props.locationName - Name of the location being deleted
 * @param {string} props.currentLocationId - ID of the location being deleted (to exclude from selector)
 * @param {boolean} props.loading - Shows loading state on confirm button
 */
const LocationReassignDialog = ({
  open,
  onClose,
  onConfirm,
  locationName = "",
  currentLocationId = null,
  loading = false,
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const handleConfirm = async () => {
    if (selectedLocationId && onConfirm) {
      await onConfirm(selectedLocationId);
    }
  };

  const handleClose = () => {
    setSelectedLocationId("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            background: "rgba(0,0,0,0.4)",
          },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 2,
          }}
        >
          <WarningAmberIcon
            sx={{ fontSize: 48, mb: 1, color: "warning.main" }}
          />
          <Typography variant="h6" component="div" textAlign="center">
            Reassign Items Before Deleting
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          This location has items associated with it. Please select a new
          location to reassign them before deletion.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You are deleting:{" "}
          <Typography component="span" fontWeight="bold">
            {locationName}
          </Typography>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Select New Location for Items
          </Typography>
          <ParentLocationSelector
            value={selectedLocationId}
            onChange={setSelectedLocationId}
            disabledLocationId={currentLocationId}
            placeholder="Choose a location to reassign items"
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          All items currently in this location will be moved to the selected
          location.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          size="medium"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading || !selectedLocationId}
          size="medium"
        >
          {loading ? "Deleting..." : "Delete & Reassign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationReassignDialog;
