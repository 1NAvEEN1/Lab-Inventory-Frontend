# File Upload Integration Documentation

This document provides a comprehensive guide for using the integrated file upload API in your React application.

## Files Created/Updated

1. **`src/services/filesService.js`** - Enhanced file service with comprehensive API integration
2. **`src/hooks/useFileUpload.js`** - Custom React hooks for file operations
3. **`src/components/FileUpload/FileUploadComponent.jsx`** - Complete file upload component example
4. **`src/examples/fileServiceUsage.js`** - Usage examples and helper functions

## Quick Start

### 1. Basic File Upload

```javascript
import FilesService from '../services/filesService';

// Upload a single file
const uploadFile = async (file) => {
  try {
    const result = await FilesService.uploadFile(file, 'documents');
    console.log('Uploaded:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Upload multiple files
const uploadMultipleFiles = async (files) => {
  try {
    const result = await FilesService.uploadMultipleFiles(files, 'images');
    console.log('Uploaded:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 2. Using React Hooks

```javascript
import { useFileUpload } from '../hooks/useFileUpload';

const MyComponent = () => {
  const { uploadFile, uploading, error, getImageUrl } = useFileUpload();

  const handleFileUpload = async (file) => {
    try {
      const result = await uploadFile(file, 'images');
      const imageUrl = getImageUrl(result.folder, result.fileName);
      // Use imageUrl in your component
    } catch (error) {
      // Error handling
    }
  };

  return (
    <div>
      {uploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
    </div>
  );
};
```

### 3. Display Images

```javascript
import FilesService from '../services/filesService';

// In your React component
const ImageDisplay = ({ folder, filename }) => {
  const imageUrl = FilesService.getImageUrl(folder, filename);
  
  return (
    <img 
      src={imageUrl} 
      alt="Uploaded image"
      style={{ maxWidth: '200px' }}
    />
  );
};
```

### 4. File Download

```javascript
import FilesService from '../services/filesService';

// Download a file programmatically
const downloadFile = async () => {
  try {
    await FilesService.downloadFile('documents', 'report.pdf', 'my-report.pdf');
  } catch (error) {
    console.error('Download failed:', error);
  }
};

// Or create a download link
const FileDownloadLink = ({ folder, filename, displayName }) => {
  const fileUrl = FilesService.getFileUrl(folder, filename);
  
  return (
    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
      Download {displayName || filename}
    </a>
  );
};
```

## API Functions Reference

### FilesService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `uploadFile(file, folder)` | Upload single file | file: File, folder: string | Promise<response> |
| `uploadMultipleFiles(files, folder)` | Upload multiple files | files: FileList/Array, folder: string | Promise<response> |
| `getFileUrl(folder, filename)` | Get file URL | folder: string, filename: string | string |
| `getImageUrl(folder, filename)` | Get image URL | folder: string, filename: string | string |
| `downloadFile(folder, filename, customName)` | Download file | folder: string, filename: string, customName?: string | Promise |
| `getFilesFromFolder(folder)` | List files in folder | folder: string | Promise<files[]> |
| `getAllFolders()` | List all folders | - | Promise<folders[]> |

### React Hooks

#### useFileUpload()
```javascript
const {
  uploading,      // boolean - upload in progress
  downloading,    // boolean - download in progress
  error,          // string - error message
  uploadFile,     // function - upload single file
  uploadMultipleFiles, // function - upload multiple files
  downloadFile,   // function - download file
  getFileUrl,     // function - get file URL
  getImageUrl,    // function - get image URL
  clearError      // function - clear error state
} = useFileUpload();
```

#### useImageUpload()
```javascript
const {
  uploading,      // boolean - upload in progress
  imagePreview,   // string - preview URL for selected image
  uploadedImage,  // object - uploaded image data with URL
  error,          // string - error message
  uploadImage,    // function - upload image with preview
  clearImage      // function - clear image states
} = useImageUpload();
```

#### useFileManager()
```javascript
const {
  loading,        // boolean - loading state
  folders,        // array - list of folders
  currentFolder,  // string - currently selected folder
  folderFiles,    // array - files in current folder
  error,          // string - error message
  loadFolders,    // function - load all folders
  loadFolderFiles, // function - load files from folder
  refreshCurrentFolder, // function - refresh current folder
  clearFolder     // function - clear folder states
} = useFileManager();
```

## Common Folders

```javascript
import { commonFolders } from '../examples/fileServiceUsage';

// Predefined folder names
commonFolders.IMAGES     // 'images'
commonFolders.DOCUMENTS  // 'documents'
commonFolders.VIDEOS     // 'videos'
commonFolders.AUDIO      // 'audio'
commonFolders.AVATARS    // 'avatars'
commonFolders.GENERAL    // 'general'
```

## Helper Functions

```javascript
import { getFolderByFileType } from '../examples/fileServiceUsage';

// Auto-determine folder based on file type
const folder = getFolderByFileType(file);
// Returns: 'images', 'videos', 'audio', 'documents', or 'general'
```

## Example Use Cases

### 1. Profile Picture Upload

```javascript
import { useImageUpload } from '../hooks/useFileUpload';

const ProfilePictureUpload = () => {
  const { uploadImage, uploading, uploadedImage, imagePreview } = useImageUpload();

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadImage(file, 'avatars');
        // uploadedImage now contains the uploaded image data and URL
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageSelect} />
      {imagePreview && <img src={imagePreview} alt="Preview" width="100" />}
      {uploading && <p>Uploading...</p>}
      {uploadedImage && (
        <img src={uploadedImage.url} alt="Uploaded" width="100" />
      )}
    </div>
  );
};
```

### 2. Document Manager

```javascript
import { useFileManager, useFileUpload } from '../hooks/useFileUpload';

const DocumentManager = () => {
  const { folders, folderFiles, loadFolders, loadFolderFiles } = useFileManager();
  const { uploadFile } = useFileUpload();

  useEffect(() => {
    loadFolders();
  }, []);

  const handleFileUpload = async (file) => {
    await uploadFile(file, 'documents');
    // Refresh the current folder after upload
    if (currentFolder) {
      loadFolderFiles(currentFolder);
    }
  };

  return (
    <div>
      {/* Folder list and file display */}
    </div>
  );
};
```

### 3. Multi-File Upload with Progress

```javascript
import { useState } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';

const MultiFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { uploadMultipleFiles, uploading } = useFileUpload();

  const handleFilesSelect = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    try {
      const result = await uploadMultipleFiles(selectedFiles, 'documents');
      console.log('All files uploaded:', result);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFilesSelect} />
      {selectedFiles.length > 0 && (
        <div>
          <p>Selected {selectedFiles.length} files</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>
        </div>
      )}
    </div>
  );
};
```

## Error Handling

All functions include proper error handling. Errors are automatically caught and formatted:

```javascript
try {
  const result = await FilesService.uploadFile(file, 'images');
  // Success
} catch (error) {
  // error.message contains user-friendly error message
  console.error('Upload failed:', error.message);
}
```

## Notes

1. **File URLs**: Use `getFileUrl()` or `getImageUrl()` to get URLs for display or download links
2. **Folder Organization**: Files are automatically organized into folders - use appropriate folder names
3. **Backward Compatibility**: The service maintains backward compatibility with existing file systems
4. **Security**: All file operations go through the authenticated API manager
5. **Performance**: Large files should be uploaded individually rather than in batches

## Environment Variables

Make sure your `.env` file includes:

```
VITE_API_BASE_URL=http://localhost:3001
```

This integration provides a complete file management solution with proper error handling, loading states, and React best practices.