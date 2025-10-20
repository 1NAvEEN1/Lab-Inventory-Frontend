import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

/**
 * FilePreviewDialog - A reusable component for previewing files (images, PDFs, videos)
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Callback function when dialog is closed
 * @param {string} url - The URL of the file to preview (can be blob URL or server URL)
 * @param {string} type - The type of file ('image', 'pdf', 'video')
 * @param {string} title - Optional custom title for the dialog (default: "File Preview")
 */
const FilePreviewDialog = ({ 
  open, 
  onClose, 
  url, 
  type, 
  title = "File Preview" 
}) => {
  const isBlobUrl = url && url.startsWith('blob:');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ height: '100vh' }}
    >
      <DialogTitle sx={{ mt: -2, mb: 1 }}>
        {title}
        <Stack direction="row" spacing={1} sx={{ position: 'absolute', right: 8, top: 8 }}>
          {/* Open in new tab button - only show for non-blob URLs */}
          {url && !isBlobUrl && (
            <IconButton
              onClick={() => window.open(url, '_blank')}
              size="small"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.04)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
              }}
              title="Open in new tab"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small" title="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider sx={{ mb: -1 }} />
      <DialogContent 
        dividers 
        sx={{ 
          textAlign: 'center', 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          height: "100vh" 
        }}
      >
        {type === 'image' && url && (
          <img
            src={url}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        )}
        {type === 'pdf' && url && (
          <iframe
            src={url}
            width="100%"
            title="PDF Preview"
            style={{ border: 'none' }}
          />
        )}
        {type === 'video' && url && (
          <video
            src={url}
            controls
            style={{
              maxWidth: '100%',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
