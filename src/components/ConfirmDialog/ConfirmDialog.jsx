import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/**
 * Reusable confirmation dialog component
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Called when dialog is closed
 * @param {Function} props.onConfirm - Called when user confirms
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message/content
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.confirmColor - Color of confirm button (default: "primary")
 * @param {string} props.variant - Dialog variant: "warning", "error", "info", "success" (default: "warning")
 * @param {React.ReactNode} props.children - Additional content to display in dialog
 * @param {boolean} props.loading - Shows loading state on confirm button
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "primary",
  variant = "warning",
  children,
  loading = false,
}) => {
  const getIcon = () => {
    const iconProps = { sx: { fontSize: 48, mb: 1 } };
    switch (variant) {
      case "error":
        return <ErrorOutlineIcon {...iconProps} color="error" />;
      case "info":
        return <InfoIcon {...iconProps} color="info" />;
      case "success":
        return <CheckCircleOutlineIcon {...iconProps} color="success" />;
      case "warning":
      default:
        return <WarningAmberIcon {...iconProps} color="warning" />;
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          {getIcon()}
          <Typography variant="h6" component="div" textAlign="center">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: children ? 2 : 0 }}
        >
          {message}
        </Typography>
        {children}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          size="medium"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          size="medium"
          autoFocus
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
