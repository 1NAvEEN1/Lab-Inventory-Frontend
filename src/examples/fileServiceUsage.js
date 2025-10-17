/**
 * File Service Usage Examples
 * 
 * This file demonstrates how to use the enhanced FilesService
 * for various file operations including upload, retrieval, and management.
 */

import FilesService from '../services/filesService';

// Example usage functions
export const fileServiceExamples = {

  /**
   * Upload a single file to a specific folder
   */
  uploadSingleFile: async (file, folder = 'documents') => {
    try {
      const response = await FilesService.uploadFile(file, folder);
      console.log('File uploaded successfully:', response.data);
      
      // Response structure:
      // {
      //   fileName: "1698765432123-document.pdf",
      //   fileType: "application/pdf",
      //   folder: "documents",
      //   relativePath: "documents/1698765432123-document.pdf",
      //   fullPath: "/path/to/uploads/documents"
      // }
      
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  /**
   * Upload multiple files to a folder
   */
  uploadMultipleFiles: async (files, folder = 'images') => {
    try {
      const response = await FilesService.uploadMultipleFiles(files, folder);
      console.log('Files uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Multiple upload failed:', error);
      throw error;
    }
  },

  /**
   * Get image URL for display in <img> tags
   */
  getImageForDisplay: (folder, filename) => {
    // Returns a URL that can be used directly in img src
    const imageUrl = FilesService.getImageUrl(folder, filename);
    
    // Usage in React component:
    // <img src={FilesService.getImageUrl('images', 'photo.jpg')} alt="Photo" />
    
    return imageUrl;
  },

  /**
   * Get file URL for download links
   */
  getFileDownloadUrl: (folder, filename) => {
    // Returns a URL that can be used in download links
    const fileUrl = FilesService.getFileUrl(folder, filename);
    
    // Usage in React component:
    // <a href={FilesService.getFileUrl('documents', 'report.pdf')} target="_blank">
    //   Download Report
    // </a>
    
    return fileUrl;
  },

  /**
   * Download a file programmatically
   */
  downloadFile: async (folder, filename, customName = null) => {
    try {
      await FilesService.downloadFile(folder, filename, customName);
      console.log('File download initiated');
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  /**
   * List all files in a specific folder
   */
  getFilesInFolder: async (folder) => {
    try {
      const response = await FilesService.getFilesFromFolder(folder);
      console.log(`Files in ${folder} folder:`, response.data.files);
      
      // Response structure:
      // {
      //   folder: "documents",
      //   files: [
      //     {
      //       fileName: "1698765432123-document.pdf",
      //       folder: "documents",
      //       relativePath: "documents/1698765432123-document.pdf",
      //       size: 1024000,
      //       createdAt: "2023-10-31T10:30:32.123Z",
      //       modifiedAt: "2023-10-31T10:30:32.123Z"
      //     }
      //   ]
      // }
      
      return response.data.files;
    } catch (error) {
      console.error('Failed to get files:', error);
      throw error;
    }
  },

  /**
   * Get all available folders
   */
  getAllFolders: async () => {
    try {
      const response = await FilesService.getAllFolders();
      console.log('Available folders:', response.data.folders);
      
      // Response structure:
      // {
      //   folders: [
      //     {
      //       name: "documents",
      //       filesCount: 5,
      //       createdAt: "2023-10-31T10:30:32.123Z",
      //       modifiedAt: "2023-10-31T10:30:32.123Z"
      //     }
      //   ]
      // }
      
      return response.data.folders;
    } catch (error) {
      console.error('Failed to get folders:', error);
      throw error;
    }
  },

  /**
   * Handle file input change (React example)
   */
  handleFileInputChange: async (event, folder = 'general') => {
    const files = event.target.files;
    
    if (files.length === 1) {
      // Single file upload
      return await fileServiceExamples.uploadSingleFile(files[0], folder);
    } else if (files.length > 1) {
      // Multiple files upload
      return await fileServiceExamples.uploadMultipleFiles(files, folder);
    }
  },

  /**
   * Create a complete file upload component example
   */
  createFileUploadExample: () => {
    // This would be used in a React component
    const handleUpload = async (files, folder) => {
      try {
        let result;
        if (files.length === 1) {
          result = await FilesService.uploadFile(files[0], folder);
        } else {
          result = await FilesService.uploadMultipleFiles(files, folder);
        }
        
        // Handle success
        console.log('Upload successful:', result.data);
        
        // If uploading images, you can immediately get the URL
        if (folder === 'images' && result.data.fileName) {
          const imageUrl = FilesService.getImageUrl(folder, result.data.fileName);
          console.log('Image URL:', imageUrl);
        }
        
        return result;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    };

    return { handleUpload };
  }
};

// Common folder names you might use
export const commonFolders = {
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  AVATARS: 'avatars',
  THUMBNAILS: 'thumbnails',
  TEMP: 'temp',
  GENERAL: 'general'
};

// Helper function to determine folder based on file type
export const getFolderByFileType = (file) => {
  const type = file.type;
  
  if (type.startsWith('image/')) {
    return commonFolders.IMAGES;
  } else if (type.startsWith('video/')) {
    return commonFolders.VIDEOS;
  } else if (type.startsWith('audio/')) {
    return commonFolders.AUDIO;
  } else if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return commonFolders.DOCUMENTS;
  } else {
    return commonFolders.GENERAL;
  }
};

export default fileServiceExamples;