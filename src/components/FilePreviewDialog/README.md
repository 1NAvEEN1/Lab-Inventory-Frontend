# FilePreviewDialog Component

A reusable Material-UI dialog component for previewing files including images, PDFs, and videos.

## Features

- 📸 **Image Preview**: Supports JPEG, PNG, GIF, WebP
- 📄 **PDF Preview**: Inline PDF viewer with iframe
- 🎥 **Video Preview**: Built-in HTML5 video player with controls
- 🔗 **Open in New Tab**: For server-hosted files (non-blob URLs)
- 📱 **Responsive**: Full-screen dialog with responsive content
- ♻️ **Reusable**: Can be used across multiple pages and components

## Usage

### Import

```javascript
import FilePreviewDialog from "../../components/FilePreviewDialog";
```

### Basic Example

```javascript
import React, { useState, useCallback } from "react";
import FilePreviewDialog from "../../components/FilePreviewDialog";

function MyComponent() {
  const [previewDialog, setPreviewDialog] = useState({ 
    open: false, 
    url: "", 
    type: "" 
  });

  const handlePreview = (fileUrl, fileType) => {
    setPreviewDialog({ open: true, url: fileUrl, type: fileType });
  };

  const closePreview = useCallback(() => {
    // Cleanup blob URLs if needed
    if (previewDialog.url && previewDialog.url.startsWith('blob:')) {
      URL.revokeObjectURL(previewDialog.url);
    }
    setPreviewDialog({ open: false, url: "", type: "" });
  }, [previewDialog.url]);

  return (
    <>
      <button onClick={() => handlePreview("/path/to/image.jpg", "image")}>
        Preview Image
      </button>

      <FilePreviewDialog
        open={previewDialog.open}
        onClose={closePreview}
        url={previewDialog.url}
        type={previewDialog.type}
        title="My File Preview"
      />
    </>
  );
}
```

### With File Upload (Blob URLs)

```javascript
const handleFileSelect = (file) => {
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    setPreviewDialog({ open: true, url, type: 'image' });
  } else if (file.type === 'application/pdf') {
    const url = URL.createObjectURL(file);
    setPreviewDialog({ open: true, url, type: 'pdf' });
  } else if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file);
    setPreviewDialog({ open: true, url, type: 'video' });
  }
};
```

### With Server Files

```javascript
const previewExistingFile = (fileName, folder = 'uploads') => {
  const url = FilesService.getImageUrl(folder, fileName);
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    setPreviewDialog({ open: true, url, type: 'image' });
  } else if (extension === 'pdf') {
    setPreviewDialog({ open: true, url, type: 'pdf' });
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
    setPreviewDialog({ open: true, url, type: 'video' });
  }
};
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | boolean | Yes | - | Controls whether the dialog is open |
| `onClose` | function | Yes | - | Callback function when dialog is closed |
| `url` | string | Yes | - | The URL of the file to preview (blob URL or server URL) |
| `type` | string | Yes | - | The type of file: `'image'`, `'pdf'`, or `'video'` |
| `title` | string | No | "File Preview" | Custom title for the dialog |

## File Types

### Supported Image Formats
- JPEG / JPG
- PNG
- GIF
- WebP

### Supported Document Formats
- PDF (inline preview)

### Supported Video Formats
- MP4
- AVI
- MOV
- WMV
- FLV
- WebM

## Features Details

### Open in New Tab
- Only available for server-hosted files (non-blob URLs)
- Allows users to open the file in a new browser tab
- Useful for downloading or viewing in full screen
- Icon button located in the top-right corner

### Memory Management
- Remember to revoke blob URLs when closing the dialog
- Use `URL.revokeObjectURL()` in the `onClose` callback
- Server URLs don't require cleanup

### Responsive Design
- Full-screen height dialog
- Images scale to fit while maintaining aspect ratio
- PDFs use full available height
- Videos scale responsively

## Example Implementation

See `src/pages/Inventory/AddItem.jsx` for a complete implementation example.

## Styling

The component uses Material-UI's theming system and can be customized through your theme configuration.

## Browser Compatibility

- Modern browsers with HTML5 support
- PDF preview requires browser with iframe support
- Video preview requires HTML5 video support
