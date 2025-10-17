import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import ParentCategorySelector from '../components/ParentCategorySelector';

/**
 * Example component demonstrating how to use ParentCategorySelector
 * with thumbnail upload functionality
 */
const ParentCategorySelectorExample = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const selectorRef = useRef();

  const handleSave = async () => {
    try {
      // Get the current thumbnail file from the selector
      const currentFile = selectorRef.current?.getCurrentThumbnailFile();
      
      let uploadedThumbnailUrl = '';
      
      if (currentFile) {
        // Only upload if there's a new file
        console.log('Uploading new thumbnail file:', currentFile.name);
        
        // Here you would typically upload the file using your file service
        // const { data } = await FilesService.upload(currentFile);
        // uploadedThumbnailUrl = data?.url || data?.path || data;
        
        // For demo purposes, create a temporary URL
        uploadedThumbnailUrl = URL.createObjectURL(currentFile);
      } else if (thumbnailUrl) {
        // Use existing URL if no new file
        uploadedThumbnailUrl = thumbnailUrl;
      }

      // Save category data
      const categoryData = {
        parentCategoryId: selectedCategory,
        thumbnail: uploadedThumbnailUrl,
        // ... other category fields
      };

      console.log('Saving category:', categoryData);
      alert('Category saved successfully!');
      
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleThumbnailChange = (file) => {
    setThumbnailFile(file);
    if (!file) {
      setThumbnailUrl('');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
        Parent Category Selector with Thumbnail Example
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <ParentCategorySelector
          ref={selectorRef}
          value={selectedCategory}
          onChange={setSelectedCategory}
          showThumbnail={true}
          thumbnailValue={thumbnailUrl}
          onThumbnailChange={handleThumbnailChange}
          thumbnailHelperText="Drag and drop an image or click to browse. Maximum 2MB."
        />
      </Box>

      <Stack direction="row" spacing={2}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!selectedCategory && !thumbnailFile}
        >
          Save Category
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => {
            setSelectedCategory('');
            setThumbnailFile(null);
            setThumbnailUrl('');
          }}
        >
          Clear
        </Button>
      </Stack>

      {/* Debug Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Debug Info:
        </Typography>
        <Typography variant="body2">
          Selected Category ID: {selectedCategory || 'None'}
        </Typography>
        <Typography variant="body2">
          Has Thumbnail File: {thumbnailFile ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          Thumbnail URL: {thumbnailUrl || 'None'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ParentCategorySelectorExample;