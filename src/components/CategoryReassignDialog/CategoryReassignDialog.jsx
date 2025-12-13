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
import ParentCategorySelector from "../ParentCategorySelector";

/**
 * Dialog for reassigning items when deleting a category
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Called when dialog is closed
 * @param {Function} props.onConfirm - Called with selected category ID when confirmed
 * @param {string} props.categoryName - Name of the category being deleted
 * @param {string} props.currentCategoryId - ID of the category being deleted (to exclude from selector)
 * @param {boolean} props.loading - Shows loading state on confirm button
 */
const CategoryReassignDialog = ({
  open,
  onClose,
  onConfirm,
  categoryName = "",
  currentCategoryId = null,
  loading = false,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleConfirm = async () => {
    if (selectedCategoryId && onConfirm) {
      await onConfirm(selectedCategoryId);
    }
  };

  const handleClose = () => {
    setSelectedCategoryId("");
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
          This category has items associated with it. Please select a new
          category to reassign them before deletion.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You are deleting:{" "}
          <Typography component="span" fontWeight="bold">
            {categoryName}
          </Typography>
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Select New Category for Items
          </Typography>
          <ParentCategorySelector
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            excludeCategoryId={currentCategoryId}
            placeholder="Choose a category to reassign items"
          />
        </Box>

        <Typography variant="caption" color="text.secondary">
          All items currently in this category will be moved to the selected
          category.
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
          disabled={loading || !selectedCategoryId}
          size="medium"
        >
          {loading ? "Deleting..." : "Delete & Reassign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryReassignDialog;
