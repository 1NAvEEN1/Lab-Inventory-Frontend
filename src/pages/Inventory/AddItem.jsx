import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Grid,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import AttributeInput from "../../components/Attributes/AttributeInput";
import {
  ATTRIBUTE_TYPES,
  requiresOptions,
} from "../../components/Attributes/types";
import CategorySelector from "../../components/CategorySelector";
import CategoriesService from "../../services/categoriesService";
import ItemsService from "../../services/itemsService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";
import FilePreviewDialog from "../../components/FilePreviewDialog";

const mergeAttributes = (existing = [], incoming = []) => {
  const map = new Map();
  existing.forEach((attr) => {
    map.set(attr.label, attr);
  });

  incoming.forEach((attr) => {
    const prev = map.get(attr.label);
    map.set(attr.label, {
      ...(prev || {}),
      ...attr,
      options:
        attr.options && attr.options.length > 0
          ? attr.options
          : prev?.options || [],
    });
  });

  return Array.from(map.values());
};

const AddItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: viewId } = useParams();
  const editId = searchParams.get("edit");

  // Determine the mode: view, edit, or create
  const isViewMode = Boolean(viewId);
  const isEditMode = Boolean(editId);
  const isCreateMode = !isViewMode && !isEditMode;

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState([]);
  const imagesRef = useRef([]);
  const [fileFiles, setFileFiles] = useState([]);
  const fileFilesRef = useRef([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // Upload states
  const [imageDragOver, setImageDragOver] = useState(false);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    url: "",
    type: "",
  });
  const previewUrlRef = useRef("");

  const [itemAttributes, setItemAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggingImageIndex, setDraggingImageIndex] = useState(null);

  const [attrDialogOpen, setAttrDialogOpen] = useState(false);
  const [attrForm, setAttrForm] = useState({ label: "", type: "text" });
  const [attrOptionsText, setAttrOptionsText] = useState("");
  const [attrFormError, setAttrFormError] = useState("");

  // File validation functions
  const validateImageFile = useCallback((file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
    }

    if (file.size > maxSize) {
      return "Image file size must be less than 5MB";
    }

    return null;
  }, []);

  const validateGeneralFile = useCallback((file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file.size > maxSize) {
      return "File size must be less than 5MB";
    }

    return null;
  }, []);

  const isImageName = (fileName = "") => {
    const extension = fileName.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  };

  const stripTimestampPrefix = (name = "") =>
    name.replace(/^\d{4,}-/, "");

  // Helper function to get file icon based on type
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split(".").pop();
    if (["pdf"].includes(extension)) {
      return <PdfIcon sx={{ fontSize: 40, color: "#d32f2f" }} />;
    }
    if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension)) {
      return <VideoIcon sx={{ fontSize: 40, color: "#1976d2" }} />;
    }
    return <FileIcon sx={{ fontSize: 40, color: "#757575" }} />;
  };

  // Handle image file selection
  const handleImageFileSelect = useCallback(
    (files) => {
      const newFiles = Array.from(files);
      const totalCurrentCount = images.length;

      if (totalCurrentCount + newFiles.length > 5) {
        setUploadError(
          `You can upload maximum 5 images total. Currently you have ${totalCurrentCount} image(s).`
        );
        setShowErrorSnackbar(true);
        return;
      }

      const validFiles = [];
      let hasError = false;

      for (const file of newFiles) {
        const error = validateImageFile(file);
        if (error) {
          setUploadError(error);
          setShowErrorSnackbar(true);
          hasError = true;
          break;
        }
        validFiles.push(file);
      }

      if (!hasError && validFiles.length > 0) {
        setImages((prev) => [
          ...prev,
          ...validFiles.map((file, idx) => ({
            id: `new-${Date.now()}-${idx}-${file.name}`,
            type: "new",
            file,
            name: file.name,
            size: file.size,
            previewUrl: URL.createObjectURL(file),
          })),
        ]);
        setUploadError("");
      }
    },
    [images.length, validateImageFile]
  );

  // Handle general file selection
  const handleFileFileSelect = useCallback(
    (files) => {
      const newFiles = Array.from(files);
      const totalCurrentCount = fileFiles.length + existingFiles.length;

      if (totalCurrentCount + newFiles.length > 5) {
        setUploadError(
          `You can upload maximum 5 files total. Currently you have ${totalCurrentCount} file(s).`
        );
        setShowErrorSnackbar(true);
        return;
      }

      const validFiles = [];
      let hasError = false;

      for (const file of newFiles) {
        const error = validateGeneralFile(file);
        if (error) {
          setUploadError(error);
          setShowErrorSnackbar(true);
          hasError = true;
          break;
        }
        validFiles.push(file);
      }

      if (!hasError && validFiles.length > 0) {
        setFileFiles((prev) => [
          ...prev,
          ...validFiles.map((file) => {
            if (!file.previewUrl && file.type.startsWith("image/")) {
              Object.defineProperty(file, "previewUrl", {
                value: URL.createObjectURL(file),
                writable: false,
                configurable: true,
                enumerable: false,
              });
            }
            return file;
          }),
        ]);
        setUploadError("");
      }
    },
    [fileFiles.length, existingFiles.length, validateGeneralFile]
  );

  // Drag and drop handlers for images
  const handleImageDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragOver(true);
  }, []);

  const handleImageDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDragOver(false);
  }, []);

  const handleImageDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setImageDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        handleImageFileSelect(files);
      }
    },
    [handleImageFileSelect]
  );

  // Drag and drop handlers for files
  const handleFileDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileDragOver(true);
  }, []);

  const handleFileDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileDragOver(false);
  }, []);

  const handleFileDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setFileDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileFileSelect(files);
      }
    },
    [handleFileFileSelect]
  );

  // Remove file functions
  const removeImageAt = useCallback((index) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl && String(target.previewUrl).startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const removeFileFile = useCallback((index) => {
    setFileFiles((prev) => {
      const target = prev[index];
      const previewUrl = target?.previewUrl;
      if (previewUrl && String(previewUrl).startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const removeExistingFile = useCallback((index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Preview functions
  const previewFile = useCallback((file) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewDialog({ open: true, url, type: "image" });
    } else if (file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewDialog({ open: true, url, type: "pdf" });
    } else if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreviewDialog({ open: true, url, type: "video" });
    }
  }, []);

  // Preview existing files (from URL)
  const previewExistingFile = useCallback((fileName, folder = "items") => {
    const url = FilesService.getImageUrl(folder, fileName);
    const extension = fileName.toLowerCase().split(".").pop();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      setPreviewDialog({ open: true, url, type: "image" });
    } else if (extension === "pdf") {
      setPreviewDialog({ open: true, url, type: "pdf" });
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension)
    ) {
      setPreviewDialog({ open: true, url, type: "video" });
    }
  }, []);

  const closePreview = useCallback(() => {
    // Only revoke blob URLs (newly uploaded files), not server URLs
    if (previewDialog.url && previewDialog.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewDialog.url);
    }
    setPreviewDialog({ open: false, url: "", type: "" });
  }, [previewDialog.url]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    fileFilesRef.current = fileFiles;
  }, [fileFiles]);

  useEffect(() => {
    previewUrlRef.current = previewDialog.url;
  }, [previewDialog.url]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup any remaining blob URLs
      imagesRef.current.forEach((img) => {
        const previewUrl = img.previewUrl || img.file?.previewUrl || img.url;
        if (previewUrl && String(previewUrl).startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      });
      fileFilesRef.current.forEach((file) => {
        const previewUrl = file.previewUrl || file.url;
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      });
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const itemId = viewId || editId;
    if (itemId) {
      fetchItem(itemId);
    }
  }, [viewId, editId]);

  const fetchItem = async (itemId) => {
    if (!itemId) return;
    try {
      const response = await ItemsService.getById(itemId);
      const item = response.data;
      setItemName(item.name || "");
      setSku(item.sku || "");
      setDescription(item.description || "");
      setSelectedCategoryId(item.categoryId || "");

      // Handle attribute definitions and values from API
      if (item.otherAttributes && Array.isArray(item.otherAttributes)) {
        const attrs = {};
        const definitions = item.otherAttributes.map((attr) => ({
          label: attr.label,
          type: attr.type || "text",
          options: attr.options || [],
        }));

        item.otherAttributes.forEach((attr) => {
          attrs[attr.label] = attr.value;
        });

        setItemAttributes((prev) => mergeAttributes(prev, definitions));
        setAttributeValues((prev) => ({ ...prev, ...attrs }));
      }

      // Set existing images and files for viewing
      if (item.images && Array.isArray(item.images)) {
        setImages(
          item.images.map((img, idx) => ({
            id: `existing-${idx}-${img}`,
            type: "existing",
            url: img,
            name: img.split("/").pop() || `Image ${idx + 1}`,
          }))
        );
      }

      if (item.files && Array.isArray(item.files)) {
        setExistingFiles(item.files);
      }
    } catch (err) {
      showAlertMessage({ message: "Failed to fetch item", type: "error" });
      console.error("Error fetching item:", err);
    }
  };

  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedCategory(null);
      return;
    }
    CategoriesService.getById(selectedCategoryId)
      .then(({ data }) => {
        setSelectedCategory(data);
        const categoryAttrs = data?.attributes || [];
        setItemAttributes((prev) => mergeAttributes(prev, categoryAttrs));

        setAttributeValues((prev) => {
          const next = { ...prev };
          categoryAttrs.forEach((a) => {
            if (!(a.label in next)) {
              next[a.label] = null;
            }
          });
          return next;
        });
      })
      .catch(() => {
        setSelectedCategory(null);
      });
  }, [selectedCategoryId, editId, viewId]);

  const handleAttrChange = (label, value) => {
    setAttributeValues((prev) => ({ ...prev, [label]: value }));
  };

  const resetAttrForm = () => {
    setAttrForm({ label: "", type: "text" });
    setAttrOptionsText("");
    setAttrFormError("");
  };

  const handleOpenAttrDialog = () => {
    resetAttrForm();
    setAttrDialogOpen(true);
  };

  const handleSaveAttributeDefinition = () => {
    const label = attrForm.label.trim();
    if (!label) {
      setAttrFormError("Attribute label is required");
      return;
    }

    const options = requiresOptions(attrForm.type)
      ? attrOptionsText
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean)
      : [];

    const newAttr = {
      label,
      type: attrForm.type,
      options,
    };

    setItemAttributes((prev) => mergeAttributes(prev, [newAttr]));
    setAttributeValues((prev) => ({
      ...prev,
      [label]: label in prev ? prev[label] : null,
    }));

    setAttrDialogOpen(false);
    resetAttrForm();
  };

  const combinedAttributes = useMemo(() => itemAttributes, [itemAttributes]);

  const cardBaseStyles = {
    position: "relative",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
    overflow: "hidden",
    backgroundColor: "background.paper",
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
  };

  const handleImageReorder = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === null || toIndex === null) return;
      if (fromIndex === toIndex) return;
      setImages((prev) => {
        const updated = [...prev];
        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= updated.length ||
          toIndex >= updated.length
        ) {
          return prev;
        }
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      });
    },
    []
  );

  const imageList = useMemo(
    () =>
      images.map((item, index) => ({
        ...item,
        isPrimary: index === 0,
        displayName:
          item.type === "existing"
            ? stripTimestampPrefix(item.name)
            : item.name,
      })),
    [images]
  );

  const handleRemoveAttribute = (index) => {
    const attrToRemove = combinedAttributes[index];
    setItemAttributes((prev) => prev.filter((_, i) => i !== index));
    // Optionally clear the value for this attribute
    setAttributeValues((prev) => {
      const next = { ...prev };
      delete next[attrToRemove.label];
      return next;
    });
  };

  const uploadMany = async (files, folder = "items") => {
    const uploads = Array.from(files || []).map((f) =>
      FilesService.uploadFile(f, folder).then(
        (r) => r.data?.fileName || r.data?.url || r.data?.path || r.data
      )
    );
    return Promise.all(uploads);
  };

  const handleSave = async () => {
    try {
      const newImageTargets = images.filter((img) => img.type === "new");
      const uploadedImages =
        newImageTargets.length > 0
          ? await uploadMany(newImageTargets.map((img) => img.file))
          : [];
      const newFileUrls =
        fileFiles.length > 0 ? await uploadMany(fileFiles) : [];

      let uploadIdx = 0;
      const orderedImages = images.map((img) => {
        if (img.type === "existing") return img.url;
        const mapped = uploadedImages[uploadIdx];
        uploadIdx += 1;
        return mapped;
      });

      // Map all item attributes (category + custom), preserving the values from attributeValues
      const attributesPayload = combinedAttributes.map((a) => ({
        label: a.label,
        type: a.type,
        options: a.options || [],
        value: attributeValues[a.label] ?? null,
      }));

      const payload = {
        name: itemName,
        sku,
        description,
        categoryId: selectedCategoryId || null,
        // Combine existing and new images/files, keeping the user-defined order
        images: orderedImages.filter(Boolean),
        files: [...existingFiles, ...newFileUrls].filter(Boolean),
        otherAttributes: attributesPayload,
      };

      console.log("Saving payload:", payload);

      if (editId) {
        await ItemsService.update(editId, payload);
        showAlertMessage({
          message: "Item updated successfully",
          type: "success",
        });
      } else {
        await ItemsService.save(payload);
        showAlertMessage({
          message: "Item created successfully",
          type: "success",
        });
      }

      navigate("/inventory/items");
    } catch (e) {
      showAlertMessage({
        message: editId ? "Failed to update item" : "Failed to create item",
        type: "error",
      });
      console.error("Save error:", e);
    }
  };

  const handleEdit = () => {
    navigate(`/inventory/items/add-item?edit=${viewId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await ItemsService.delete(viewId);
      showAlertMessage({
        message: "Item deleted successfully",
        type: "success",
      });
      navigate("/inventory/items");
    } catch (err) {
      showAlertMessage({ message: "Failed to delete item", type: "error" });
      console.error("Error deleting item:", err);
    }
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={"space-between"}
        spacing={0}
        sx={{ mb: 1 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/items")}
          color="primary"
        >
          Back
        </Button>
        <Typography variant="h6" gutterBottom>
          {isViewMode ? "View Item" : isEditMode ? "Edit Item" : "Create Item"}
        </Typography>
        {isViewMode && (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Stack>
        )}
        {!isViewMode && <div></div>}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Box display={"flex"} justifyContent={"center"}>
        <Box width={"700px"}>
          <Box sx={{ mb: 3, maxWidth: "700px" }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ mb: 0.5 }}>Item Name</Typography>
                <TextField
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={isViewMode}
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>SKU (Serial Number)</Typography>
                <TextField
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={isViewMode}
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Category</Typography>
                <CategorySelector
                  value={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                  disabled={isViewMode}
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Description</Typography>
                <TextField
                  placeholder="Enter item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  disabled={isViewMode}
                />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography>
                    Images {!isViewMode && "(Max 5 images, 5MB each)"}
                  </Typography>
                  {!isViewMode && images.length > 0 && (
                    <Chip
                      label={`${images.length}/5`}
                      size="small"
                      color={images.length >= 5 ? "error" : "primary"}
                      variant="outlined"
                    />
                  )}
                </Stack>

                {isViewMode && images.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontStyle: "italic" }}
                  >
                    No images uploaded
                  </Typography>
                )}

                {(!isViewMode || images.length > 0) && (
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {!isViewMode && (
                      <Grid item xs={6} sm={4} md={3}>
                        <Tooltip
                          title="Supported: JPEG, PNG, GIF, WebP · Max 5MB · Drag cards to reorder (first is primary)"
                          placement="bottom"
                          
                        >
                          <Card
                            sx={{
                              ...cardBaseStyles,
                              borderStyle: "dashed",
                              borderColor:
                                images.length >= 5 ? "divider" : "primary.main",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              backgroundColor: imageDragOver
                                ? "rgba(25, 118, 210, 0.04)"
                                : "transparent",
                              cursor: images.length >= 5 ? "not-allowed" : "pointer",
                              p: 2,
                            }}
                            onDragOver={handleImageDragOver}
                            onDragLeave={handleImageDragLeave}
                            onDrop={handleImageDrop}
                          >
                            <CloudUploadIcon
                              sx={{ fontSize: 40, color: "grey.500", mb: 1 }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {images.length >= 5
                                ? "Maximum image limit reached (5/5)"
                                : "Drag images here or click to browse"}
                            </Typography>
                            {/* <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 1 }}
                            >
                              Supported: JPEG, PNG, GIF, WebP · Max 5MB · Drag cards to reorder (first is primary)
                            </Typography> */}
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              disabled={images.length >= 5}
                              startIcon={<CloudUploadIcon />}
                              sx={{mt:2}}
                            >
                              Upload Images
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageFileSelect(e.target.files)}
                                style={{ display: "none" }}
                              />
                            </Button>
                          </Card>
                        </Tooltip>
                      </Grid>
                    )}
                    {imageList.map((item, index) => {
                      const imageSrc =
                        item.type === "existing"
                          ? FilesService.getImageUrl("items", item.url)
                          : item.previewUrl || item.file?.previewUrl;

                      return (
                        <Grid
                          item
                          key={item.id}
                          xs={6}
                          sm={4}
                          md={3}
                          onDragOver={(e) => {
                            if (!isViewMode) e.preventDefault();
                          }}
                          onDrop={(e) => {
                            if (!isViewMode) {
                              e.preventDefault();
                              handleImageReorder(draggingImageIndex, index);
                              setDraggingImageIndex(null);
                            }
                          }}
                        >
                          <Card
                            sx={{
                              ...cardBaseStyles,
                              cursor: isViewMode ? "default" : "grab",
                              borderColor: item.isPrimary
                                ? "primary.main"
                                : draggingImageIndex === index
                                ? "primary.light"
                                : "divider",
                            }}
                            draggable={!isViewMode}
                            onDragStart={() => {
                              if (!isViewMode) setDraggingImageIndex(index);
                            }}
                            onDragEnd={() => setDraggingImageIndex(null)}
                          >
                            <Box sx={{ height: 140, position: "relative" }}>
                              <CardMedia
                                component="img"
                                image={imageSrc}
                                alt={item.displayName}
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              {item.isPrimary && (
                                <Chip
                                  label="Primary"
                                  size="small"
                                  color="primary"
                                  sx={{ position: "absolute", bottom: 8, left: 8 }}
                                />
                              )}
                            </Box>
                            <CardContent sx={{ flex: 1, p: 1.25, "&:last-child": { pb: 1.25 } }}>
                              <Typography
                                variant="caption"
                                // noWrap
                                title={item.displayName}
                                sx={{ display: "block" }}
                              >
                                {item.displayName}
                              </Typography>
                              {item.type === "new" && item.size && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  {(item.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              )}
                            </CardContent>

                            {!isViewMode && (
                              <IconButton
                                size="small"
                                onClick={() => removeImageAt(index)}
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  backgroundColor: "rgba(244, 67, 54, 0.9)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 1)",
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() =>
                                item.type === "existing"
                                  ? previewExistingFile(item.url, "items")
                                  : previewFile(item.file)
                              }
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: isViewMode ? 8 : 40,
                                backgroundColor: "rgba(0,0,0,0.7)",
                                color: "white",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  <Typography>
                    Files {!isViewMode && "(Max 5 files, 5MB each)"}
                  </Typography>
                  {!isViewMode &&
                    fileFiles.length + existingFiles.length > 0 && (
                      <Chip
                        label={`${fileFiles.length + existingFiles.length}/5`}
                        size="small"
                        color={
                          fileFiles.length + existingFiles.length >= 5
                            ? "error"
                            : "primary"
                        }
                        variant="outlined"
                      />
                    )}
                </Stack>

                {/* No files message in view mode */}
                {isViewMode && existingFiles.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontStyle: "italic" }}
                  >
                    No files uploaded
                  </Typography>
                )}

                {/* File Preview Cards */}
                {(!isViewMode || fileFiles.length > 0 || existingFiles.length > 0) && (
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {!isViewMode && (
                      <Grid item xs={6} sm={4} md={3}>
                        <Tooltip
                          title="Any file type · Max 5MB"
                          placement="top"
                        >
                          <Card
                            sx={{
                              ...cardBaseStyles,
                              borderStyle: "dashed",
                              borderColor:
                                fileFiles.length + existingFiles.length >= 5
                                  ? "divider"
                                  : "primary.main",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              backgroundColor: fileDragOver
                                ? "rgba(25, 118, 210, 0.04)"
                                : "transparent",
                              cursor:
                                fileFiles.length + existingFiles.length >= 5
                                  ? "not-allowed"
                                  : "pointer",
                              p: 2,
                            }}
                            onDragOver={handleFileDragOver}
                            onDragLeave={handleFileDragLeave}
                            onDrop={handleFileDrop}
                          >
                            <FileIcon sx={{ fontSize: 40, color: "grey.500", mb: 1 }} />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                            >
                              {fileFiles.length + existingFiles.length >= 5
                                ? "Maximum file limit reached (5/5)"
                                : "Drag files here or click to browse"}
                            </Typography>
                            {/* <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 1 }}
                            >
                              Any type · Max 5MB
                            </Typography> */}
                            <Button
                              variant="outlined"
                              component="label"
                              size="small"
                              disabled={fileFiles.length + existingFiles.length >= 5}
                              startIcon={<CloudUploadIcon />}
                              sx={{mt:2}}
                            >
                              Upload Files
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileFileSelect(e.target.files)}
                                style={{ display: "none" }}
                              />
                            </Button>
                          </Card>
                        </Tooltip>
                      </Grid>
                    )}
                    {/* Existing Files (for view/edit mode) */}
                    {existingFiles.map((fileUrl, index) => {
                      const rawFileName =
                        fileUrl.split("/").pop() || `File ${index + 1}`;
                      const displayName = stripTimestampPrefix(rawFileName);
                      const isImage = isImageName(rawFileName);
                      const imageSrc = isImage
                        ? FilesService.getImageUrl("items", fileUrl)
                        : null;
                      return (
                        <Grid
                          item
                          key={`existing-file-${index}`}
                          xs={6}
                          sm={4}
                          md={3}
                        >
                          <Card sx={{ ...cardBaseStyles }}>
                            {isImage && (
                              <Box sx={{ height: 140, position: "relative" }}>
                                <CardMedia
                                  component="img"
                                  image={imageSrc}
                                  alt={rawFileName}
                                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                            )}
                            <CardContent sx={{ textAlign: "center", p: 2, flex: 1 }}>
                              {!isImage && getFileIcon(rawFileName)}
                              <Typography
                                variant="caption"
                                sx={{ display: "block", mt: isImage ? 0 : 1 }}
                                // noWrap
                                title={displayName}
                              >
                                {displayName}
                              </Typography>
                              {/* <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                Existing File
                              </Typography> */}
                            </CardContent>
                            {isEditMode && (
                              <IconButton
                                size="small"
                                onClick={() => removeExistingFile(index)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  backgroundColor: "rgba(244, 67, 54, 0.8)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 1)",
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={() =>
                                previewExistingFile(fileUrl, "items")
                              }
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: isEditMode ? 40 : 4,
                                backgroundColor: "rgba(0,0,0,0.7)",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "rgba(0,0,0,0.8)",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Card>
                        </Grid>
                      );
                    })}

                    {/* New Files */}
                    {fileFiles.map((file, index) => {
                      const isImage = file.type?.startsWith("image/");
                      const imageSrc = (() => {
                        if (!isImage) return null;
                        if (!file.previewUrl) {
                          Object.defineProperty(file, "previewUrl", {
                            value: URL.createObjectURL(file),
                            writable: false,
                            configurable: true,
                            enumerable: false,
                          });
                        }
                        return file.previewUrl;
                      })();
                      return (
                        <Grid item key={`new-file-${index}`} xs={6} sm={4} md={3}>
                          <Card sx={{ ...cardBaseStyles }}>
                            {isImage && (
                              <Box sx={{ height: 140, position: "relative" }}>
                                <CardMedia
                                  component="img"
                                  image={imageSrc}
                                  alt={file.name}
                                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                            )}
                            <CardContent sx={{ textAlign: "center", p: 2, flex: 1 }}>
                              {!isImage && getFileIcon(file.name)}
                              <Typography
                                variant="caption"
                                sx={{ display: "block", mt: isImage ? 0 : 1 }}
                                noWrap
                                title={file.name}
                              >
                                {file.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </CardContent>
                            {!isViewMode && (
                              <IconButton
                                size="small"
                                onClick={() => removeFileFile(index)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  backgroundColor: "rgba(244, 67, 54, 0.8)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(244, 67, 54, 1)",
                                  },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                            {(file.type.startsWith("image/") ||
                              file.type === "application/pdf" ||
                              file.type.startsWith("video/")) && (
                              <IconButton
                                size="small"
                                onClick={() => previewFile(file)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: isViewMode ? 4 : 40,
                                  backgroundColor: "rgba(0,0,0,0.7)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Stack>
          </Box>

          {(combinedAttributes.length > 0 || !isViewMode) && (
            <Box sx={{ mb: 3, maxWidth: "700px" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2, gap: 1 }}
              >
                <Box>
                  <Typography variant="h6">Attributes</Typography>
                  {selectedCategory?.name && (
                    <Typography variant="caption" color="text.secondary">
                      Current category: {selectedCategory.name}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Divider />

              {combinedAttributes.length === 0 && (
                <Typography variant="body2" color="text.secondary" mt={2} mb={2}>
                  No attributes yet
                </Typography>
              )}

              <Stack spacing={0}>
                {combinedAttributes.map((attr, index) => (
                  <Box key={attr.label + attr.type}>
                    {index > 0 && <Divider />}
                    <Box sx={{ borderColor: "divider", p: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <AttributeInput
                            attribute={attr}
                            value={attributeValues[attr.label]}
                            onChange={(val) =>
                              handleAttrChange(attr.label, val)
                            }
                            disabled={isViewMode}
                          />
                        </Box>
                        {!isViewMode && (
                          <IconButton
                            color="disabled"
                            onClick={() => handleRemoveAttribute(index)}
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>
              {!isViewMode && (
                <>
                  <Divider sx={{ mt: 0, mb: 2 }} />
                  <Box display={"flex"} justifyContent={"end"}>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      size="small"
                      onClick={handleOpenAttrDialog}
                    >
                      Add Attribute
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          )}

          <Stack
            direction="row"
            spacing={2}
            mt={5}
            display={"flex"}
            justifyContent={"space-between"}
            maxWidth={"700px"}
            pr={2}
          >
            {!isViewMode && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setItemName("");
                    setSku("");
                    setDescription("");
                    setSelectedCategoryId("");
                    setSelectedCategory(null);
                    setImages([]);
                    setFileFiles([]);
                    setExistingFiles([]);
                    setItemAttributes([]);
                    setAttributeValues({});
                    setUploadError("");
                  }}
                  size="small"
                >
                  Clear All Data
                </Button>
                <div>
                  <Button
                    variant="outlined"
                    onClick={() => setPreviewOpen(true)}
                    size="small"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!itemName}
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    {isEditMode ? "Update Item" : "Save Item"}
                  </Button>
                </div>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Item Preview</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            {itemName || "Untitled Item"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            SKU: {sku || "No SKU"}
          </Typography>
          {selectedCategory && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category: {selectedCategory.name}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description || "No description"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {combinedAttributes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attributes for this category
              </Typography>
            )}
            {combinedAttributes.map((a) => (
              <Box key={a.label + a.type}>
                <Typography variant="caption" color="text.secondary">
                  {a.label}
                </Typography>
                <Typography variant="body2">
                  {String(attributeValues[a.label] ?? "—")}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={attrDialogOpen}
        onClose={() => setAttrDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Attribute</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Label"
              value={attrForm.label}
              onChange={(e) => {
                setAttrForm((prev) => ({ ...prev, label: e.target.value }));
                setAttrFormError("");
              }}
              fullWidth
              size="small"
              error={Boolean(attrFormError)}
              helperText={attrFormError}
              autoFocus
            />
            <TextField
              select
              label="Data Type"
              value={attrForm.type}
              onChange={(e) =>
                setAttrForm((prev) => ({ ...prev, type: e.target.value }))
              }
              fullWidth
              size="small"
            >
              {ATTRIBUTE_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            {requiresOptions(attrForm.type) && (
              <Box>
                <TextField
                  label="Options (comma separated)"
                  value={attrOptionsText}
                  onChange={(e) => setAttrOptionsText(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Used for dropdown and radio"
                />
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  {attrOptionsText
                    .split(",")
                    .map((opt) => opt.trim())
                    .filter(Boolean)
                    .map((opt) => (
                      <Chip key={opt} label={opt} size="small" />
                    ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttrDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAttributeDefinition}
            variant="contained"
            size="small"
          >
            Save Attribute
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <FilePreviewDialog
        open={previewDialog.open}
        onClose={closePreview}
        url={previewDialog.url}
        type={previewDialog.type}
        title="File Preview"
      />

      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowErrorSnackbar(false)}
        message={uploadError}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </Box>
  );
};

export default AddItem;
