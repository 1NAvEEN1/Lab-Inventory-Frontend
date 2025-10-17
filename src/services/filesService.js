import api from "./apiManager";

const FilesService = {
  /**
   * Upload a single file to a specified folder
   * @param {File} file - The file to upload
   * @param {string} folder - Folder name where the file should be stored (optional, defaults to 'general')
   * @returns {Promise} API response with file details
   */
  uploadFile: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    return api.post("/Upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Upload multiple files to a specified folder
   * @param {FileList|Array} files - Array of files to upload (max 10 files)
   * @param {string} folder - Folder name where files should be stored (optional, defaults to 'general')
   * @returns {Promise} API response with files details
   */
  uploadMultipleFiles: (files, folder = 'general') => {
    const formData = new FormData();
    
    // Handle both FileList and Array
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      formData.append('files', file);
    });
    formData.append("folder", folder);
    
    return api.post("/Upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Get a file from a specific folder
   * @param {string} folder - Folder name
   * @param {string} filename - File name
   * @returns {Promise} File response
   */
  getFileFromFolder: (folder, filename) => {
    return api.get(`/Files/${folder}/${filename}`, {
      responseType: 'blob' // For file downloads
    });
  },

  /**
   * Get a file by filename (backward compatible - searches root then general folder)
   * @param {string} filename - File name
   * @returns {Promise} File response
   */
  getFile: (filename) => {
    return api.get(`/Files/${filename}`, {
      responseType: 'blob' // For file downloads
    });
  },

  /**
   * Get the URL for a file in a specific folder (for images, etc.)
   * @param {string} folder - Folder name
   * @param {string} filename - File name
   * @returns {string} File URL
   */
  getFileUrl: (folder, filename) => {
    const baseURL = api.defaults.baseURL;
    return `${baseURL}/Files/${folder}/${filename}`;
  },

  /**
   * Get the URL for a file (backward compatible)
   * @param {string} filename - File name
   * @returns {string} File URL
   */
  getFileUrlByName: (filename) => {
    const baseURL = api.defaults.baseURL;
    return `${baseURL}/Files/${filename}`;
  },

  /**
   * Get image URL for display (convenience method for images)
   * @param {string} folder - Folder name (e.g., 'images')
   * @param {string} filename - Image filename
   * @returns {string} Image URL
   */
  getImageUrl: (folder, filename) => {
    return FilesService.getFileUrl(folder, filename);
  },

  /**
   * Get image URL by filename only (backward compatible)
   * @param {string} filename - Image filename
   * @returns {string} Image URL
   */
  getImageUrlByName: (filename) => {
    return FilesService.getFileUrlByName(filename);
  },

  /**
   * List all files in a specific folder with metadata
   * @param {string} folder - Folder name
   * @returns {Promise} API response with files list
   */
  getFilesFromFolder: (folder) => {
    return api.get(`/Files/list/${folder}`);
  },

  /**
   * Get list of all available folders in the uploads directory
   * @returns {Promise} API response with folders list
   */
  getAllFolders: () => {
    return api.get("/Files/folders");
  },

  /**
   * Download a file and trigger browser download
   * @param {string} folder - Folder name
   * @param {string} filename - File name
   * @param {string} downloadName - Optional custom download name
   * @returns {Promise} Download response
   */
  downloadFile: async (folder, filename, downloadName = null) => {
    try {
      const response = await FilesService.getFileFromFolder(folder, filename);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName || filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  /**
   * Download a file by filename only (backward compatible)
   * @param {string} filename - File name
   * @param {string} downloadName - Optional custom download name
   * @returns {Promise} Download response
   */
  downloadFileByName: async (filename, downloadName = null) => {
    try {
      const response = await FilesService.getFile(filename);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName || filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  // Legacy method for backward compatibility
  upload: (file) => {
    return FilesService.uploadFile(file, 'general');
  }
};

export default FilesService;


