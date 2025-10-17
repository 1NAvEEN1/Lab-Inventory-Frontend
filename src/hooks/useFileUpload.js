import { useState, useCallback } from 'react';
import FilesService from '../services/filesService';

/**
 * Custom hook for file upload and management operations
 * Provides easy-to-use functions for common file operations
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (file, folder = 'general') => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await FilesService.uploadFile(file, folder);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, []);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files, folder = 'general') => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await FilesService.uploadMultipleFiles(files, folder);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, []);

  // Download file
  const downloadFile = useCallback(async (folder, filename, customName = null) => {
    setDownloading(true);
    setError(null);
    
    try {
      await FilesService.downloadFile(folder, filename, customName);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Download failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDownloading(false);
    }
  }, []);

  // Get file URL (for images, links, etc.)
  const getFileUrl = useCallback((folder, filename) => {
    return FilesService.getFileUrl(folder, filename);
  }, []);

  // Get image URL (convenience method)
  const getImageUrl = useCallback((folder, filename) => {
    return FilesService.getImageUrl(folder, filename);
  }, []);

  // Get files from folder
  const getFilesFromFolder = useCallback(async (folder) => {
    setError(null);
    
    try {
      const response = await FilesService.getFilesFromFolder(folder);
      return response.data.files || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get files';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get all folders
  const getAllFolders = useCallback(async () => {
    setError(null);
    
    try {
      const response = await FilesService.getAllFolders();
      return response.data.folders || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get folders';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    // State
    uploading,
    downloading,
    error,
    
    // Actions
    uploadFile,
    uploadMultipleFiles,
    downloadFile,
    getFileUrl,
    getImageUrl,
    getFilesFromFolder,
    getAllFolders,
    clearError
  };
};

/**
 * Custom hook for image upload and display
 * Specialized for image handling with preview capabilities
 */
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState(null);

  // Upload image with preview
  const uploadImage = useCallback(async (imageFile, folder = 'images') => {
    setUploading(true);
    setError(null);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(imageFile);
      setImagePreview(previewUrl);
      
      // Upload image
      const response = await FilesService.uploadFile(imageFile, folder);
      const uploadedData = response.data;
      
      // Set uploaded image URL
      const imageUrl = FilesService.getImageUrl(uploadedData.folder, uploadedData.fileName);
      setUploadedImage({
        ...uploadedData,
        url: imageUrl
      });
      
      // Clean up preview
      URL.revokeObjectURL(previewUrl);
      setImagePreview(null);
      
      return uploadedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Image upload failed';
      setError(errorMessage);
      
      // Clean up preview on error
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [imagePreview]);

  // Clear states
  const clearImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setUploadedImage(null);
    setError(null);
  }, [imagePreview]);

  return {
    // State
    uploading,
    imagePreview,
    uploadedImage,
    error,
    
    // Actions
    uploadImage,
    clearImage
  };
};

/**
 * Custom hook for file management operations
 * Provides folder and file listing capabilities
 */
export const useFileManager = () => {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [error, setError] = useState(null);

  // Load all folders
  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await FilesService.getAllFolders();
      setFolders(response.data.folders || []);
      return response.data.folders || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load folders';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load files from specific folder
  const loadFolderFiles = useCallback(async (folder) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await FilesService.getFilesFromFolder(folder);
      setCurrentFolder(folder);
      setFolderFiles(response.data.files || []);
      return response.data.files || [];
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load folder files';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current folder
  const refreshCurrentFolder = useCallback(async () => {
    if (currentFolder) {
      return await loadFolderFiles(currentFolder);
    }
  }, [currentFolder, loadFolderFiles]);

  // Clear states
  const clearFolder = useCallback(() => {
    setCurrentFolder(null);
    setFolderFiles([]);
    setError(null);
  }, []);

  return {
    // State
    loading,
    folders,
    currentFolder,
    folderFiles,
    error,
    
    // Actions
    loadFolders,
    loadFolderFiles,
    refreshCurrentFolder,
    clearFolder
  };
};

export default { useFileUpload, useImageUpload, useFileManager };