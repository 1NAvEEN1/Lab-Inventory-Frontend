import React, { useState, useEffect } from 'react';
import FilesService from '../services/filesService';
import { commonFolders, getFolderByFileType } from '../examples/fileServiceUsage';

/**
 * FileUploadComponent - A comprehensive file upload component
 * Demonstrates practical usage of the FilesService
 */
const FileUploadComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(commonFolders.GENERAL);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderFiles, setFolderFiles] = useState([]);
  const [viewingFolder, setViewingFolder] = useState('');

  // Load available folders on component mount
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await FilesService.getAllFolders();
      setFolders(response.data.folders || []);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const loadFolderFiles = async (folder) => {
    try {
      const response = await FilesService.getFilesFromFolder(folder);
      setFolderFiles(response.data.files || []);
      setViewingFolder(folder);
    } catch (error) {
      console.error('Failed to load folder files:', error);
      setFolderFiles([]);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    
    // Auto-suggest folder based on first file type
    if (files.length > 0) {
      const suggestedFolder = getFolderByFileType(files[0]);
      setSelectedFolder(suggestedFolder);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      let result;
      
      if (selectedFiles.length === 1) {
        // Single file upload
        result = await FilesService.uploadFile(selectedFiles[0], selectedFolder);
        setUploadedFiles(prev => [...prev, result.data]);
      } else {
        // Multiple files upload
        result = await FilesService.uploadMultipleFiles(selectedFiles, selectedFolder);
        setUploadedFiles(prev => [...prev, ...result.data.files]);
      }

      // Clear selection after successful upload
      setSelectedFiles([]);
      
      // Refresh folders list
      await loadFolders();
      
      // If viewing the same folder, refresh its contents
      if (viewingFolder === selectedFolder) {
        await loadFolderFiles(selectedFolder);
      }

      alert('Upload successful!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (folder, filename) => {
    try {
      await FilesService.downloadFile(folder, filename);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error.message);
    }
  };

  const renderFilePreview = (file) => {
    if (file.fileName && file.folder) {
      const isImage = file.fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      
      if (isImage) {
        return (
          <img 
            src={FilesService.getImageUrl(file.folder, file.fileName)}
            alt={file.fileName}
            style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
          />
        );
      }
    }
    
    return <div>📄 {file.fileName}</div>;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>File Upload & Management</h2>
      
      {/* File Upload Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Upload Files</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            Select Files:
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Target Folder:
            <select 
              value={selectedFolder} 
              onChange={(e) => setSelectedFolder(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              {Object.entries(commonFolders).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Selected Files:</strong>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>

      {/* Folders Section */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Browse Folders</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {folders.map((folder) => (
            <div 
              key={folder.name}
              onClick={() => loadFolderFiles(folder.name)}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: viewingFolder === folder.name ? '#e3f2fd' : '#f9f9f9'
              }}
            >
              <div><strong>📁 {folder.name}</strong></div>
              <div>Files: {folder.filesCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Created: {new Date(folder.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Folder Files Section */}
      {viewingFolder && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Files in "{viewingFolder}" folder</h3>
          
          {folderFiles.length === 0 ? (
            <p>No files in this folder</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
              {folderFiles.map((file, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                    {renderFilePreview(file)}
                  </div>
                  
                  <div style={{ fontSize: '14px' }}>
                    <div><strong>{file.fileName}</strong></div>
                    <div>Size: {(file.size / 1024).toFixed(1)} KB</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Created: {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDownload(file.folder, file.fileName)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Download
                    </button>
                    
                    <a
                      href={FilesService.getFileUrl(file.folder, file.fileName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Recently Uploaded Files</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {uploadedFiles.map((file, index) => (
              <div 
                key={index}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f0f8ff'
                }}
              >
                <div style={{ marginBottom: '5px', textAlign: 'center' }}>
                  {renderFilePreview(file)}
                </div>
                <div style={{ fontSize: '12px' }}>
                  <div><strong>{file.fileName}</strong></div>
                  <div>Folder: {file.folder}</div>
                  <div>Type: {file.fileType}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;