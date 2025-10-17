# Thumbnail Integration in AddCategory Component

This implementation adds thumbnail upload functionality directly to the AddCategory component, keeping the ParentCategorySelector component unchanged and simple.

## Features

- **MUI Avatar Display**: Shows uploaded images using Material-UI Avatar component
- **Drag & Drop**: Users can drag images directly onto the avatar
- **File Validation**: 2MB size limit with supported image formats (JPEG, PNG, GIF, WebP)
- **Lazy Upload**: Images are only uploaded when the form is submitted
- **Change Detection**: Only uploads new images during updates
- **Error Handling**: Comprehensive error messages with Snackbar notifications

## Implementation

The thumbnail functionality has been implemented directly in the `AddCategory.jsx` component without modifying the `ParentCategorySelector` component. This keeps the selector component simple and focused on its core functionality.

### Key Components Added

1. **Thumbnail States**:
   ```jsx
   const [thumbnailFile, setThumbnailFile] = useState(null);
   const [thumbnailUrl, setThumbnailUrl] = useState("");
   const [thumbnailPreview, setThumbnailPreview] = useState(null);
   const [dragOver, setDragOver] = useState(false);
   const [uploadError, setUploadError] = useState("");
   const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
   ```

2. **File Validation**:
   ```jsx
   const validateThumbnailFile = useCallback((file) => {
     const maxSize = 2 * 1024 * 1024; // 2MB
     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
     
     if (!allowedTypes.includes(file.type)) {
       return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
     }
     
     if (file.size > maxSize) {
       return 'File size must be less than 2MB';
     }
     
     return null;
   }, []);
   ```

3. **Drag and Drop Handlers**:
   ```jsx
   const handleThumbnailDrop = useCallback((e) => {
     e.preventDefault();
     e.stopPropagation();
     setDragOver(false);
     
     const files = Array.from(e.dataTransfer.files);
     if (files.length > 0) {
       handleThumbnailFileSelect(files[0]);
     }
   }, [handleThumbnailFileSelect]);
   ```

### UI Implementation

The thumbnail upload interface appears above the ParentCategorySelector:

```jsx
<Box>
  <Typography sx={{ mb: 0.5 }}>Category Thumbnail</Typography>
  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
    <Box
      onDragOver={handleThumbnailDragOver}
      onDragLeave={handleThumbnailDragLeave}
      onDrop={handleThumbnailDrop}
    >
      <input type="file" accept="image/*" onChange={handleThumbnailFileInputChange} />
      <Avatar src={thumbnailPreview}>
        {!thumbnailPreview && <AddAPhotoIcon />}
      </Avatar>
    </Box>
    
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption">
        Drag and drop an image here, or click to browse
      </Typography>
      <Typography variant="caption">
        Maximum file size: 2MB
      </Typography>
      {thumbnailPreview && (
        <Button onClick={handleRemoveThumbnail}>Remove</Button>
      )}
    </Box>
  </Stack>
</Box>

<Box>
  <Typography sx={{ mb: 0.5 }}>Parent Category</Typography>
  <ParentCategorySelector
    value={parentCategoryId}
    onChange={setParentCategoryId}
    disabled={isViewMode}
  />
</Box>
```

## File Validation

The component automatically validates uploaded files:

- **Supported formats**: JPEG, JPG, PNG, GIF, WebP
- **Maximum size**: 2MB
- **Error handling**: Shows error messages via Snackbar

## Ref Methods

When using a ref, the component exposes:

- `getCurrentThumbnailFile()`: Returns the current File object (or null)

```jsx
const selectorRef = useRef();

// Get current file before saving
const thumbnailFile = selectorRef.current?.getCurrentThumbnailFile();
```

## Integration with AddCategory Component

The component has been integrated into the `AddCategory` component, replacing the previous thumbnail upload implementation:

```jsx
<ParentCategorySelector
  value={parentCategoryId}
  onChange={setParentCategoryId}
  disabled={isViewMode}
  showThumbnail={true}
  thumbnailValue={thumbnailUrl}
  onThumbnailChange={(file) => {
    setThumbnailFile(file);
    if (!file) {
      setThumbnailUrl("");
    }
  }}
  thumbnailHelperText="Category thumbnail will be uploaded when you save the category"
/>
```

## Best Practices

1. **Lazy Upload**: Only upload images when the form is actually saved
2. **Change Detection**: Check if there's a new file before uploading in update scenarios
3. **Error Handling**: Always handle file validation errors gracefully
4. **User Feedback**: Provide clear feedback about file requirements and upload status
5. **Cleanup**: Clear file states when resetting forms

## Styling

The component uses Material-UI's Avatar component with customizable styling:

- Drag-and-drop visual feedback with border color changes
- Hover effects for better UX
- Error state indication with border color
- Responsive design that works on different screen sizes

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Clear error messages and instructions