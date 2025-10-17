import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttributePreview from "../../components/Attributes/AttributePreview";
import {
  ATTRIBUTE_TYPES,
  requiresOptions,
} from "../../components/Attributes/types";
import CategoriesService from "../../services/categoriesService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";
import { useNavigate, useSearchParams } from "react-router-dom";

// Safe id generator with fallbacks for environments where crypto.randomUUID
// isn't available (older browsers or certain build/runtime targets).
const generateId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      // Per RFC4122 v4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
    }
  } catch (e) {
    // ignore and fallback
  }

  // Last resort fallback
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
};

const emptyAttribute = () => ({
  id: generateId(),
  label: "",
  type: "text",
  options: [],
});

const AddCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [attributes, setAttributes] = useState([emptyAttribute()]);
  const [previewOpen, setPreviewOpen] = useState(false);

  React.useEffect(() => {
    CategoriesService.getAll()
      .then(({ data }) => setAllCategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      fetchCategory();
    }
  }, [editId]);

  const fetchCategory = async () => {
    try {
      const response = await CategoriesService.getById(editId);
      const category = response.data;
      setName(category.name || "");
      setDescription(category.description || "");
      setThumbnailUrl(category.thumbnail || "");
      setParentCategoryId(category.parentCategoryId || "");
      
      // Handle both array and object formats for attributes
      const categoryAttributes = category.attributes || [];
      if (Array.isArray(categoryAttributes)) {
        setAttributes(categoryAttributes.length > 0 ? categoryAttributes : [emptyAttribute()]);
      } else {
        // Convert object to array format
        const attributesArray = Object.keys(categoryAttributes).map(key => ({
          id: generateId(),
          label: key,
          type: "text", // Default type
          options: []
        }));
        setAttributes(attributesArray.length > 0 ? attributesArray : [emptyAttribute()]);
      }
    } catch (err) {
      showAlertMessage({ message: "Failed to fetch category", type: "error" });
      console.error("Error fetching category:", err);
    }
  };

  const handleAddAttribute = () =>
    setAttributes((prev) => [...prev, emptyAttribute()]);
  const handleRemoveAttribute = (id) =>
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  const handleAttrChange = (id, patch) =>
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );

  const preparedAttributes = useMemo(
    () =>
      attributes
        .filter((a) => a.label && a.type)
        .map(({ id, ...rest }) => rest),
    [attributes]
  );

  const handleUploadThumbnail = async () => {
    if (!thumbnailFile) return "";
    const { data } = await FilesService.upload(thumbnailFile);
    return data?.url || data?.path || data; // backend dependent
  };

  const handleSave = async () => {
    try {
      const thumb = await handleUploadThumbnail();
      const payload = {
        name,
        description,
        thumbnail: thumb || thumbnailUrl || "",
        parentCategoryId: parentCategoryId || null,
        attributes: preparedAttributes,
      };
      
      if (editId) {
        await CategoriesService.update(editId, payload);
        showAlertMessage({ message: "Category updated successfully", type: "success" });
      } else {
        await CategoriesService.save(payload);
        showAlertMessage({ message: "Category created successfully", type: "success" });
      }
      
      navigate("/inventory/categories");
    } catch (e) {
      showAlertMessage({ 
        message: editId ? "Failed to update category" : "Failed to create category", 
        type: "error" 
      });
    }
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent={"space-between"} spacing={0} sx={{ mb: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/categories")}
          color="primary"
        >
          Back
        </Button>
        <Typography variant="h5" gutterBottom>
          {editId ? "Edit Category" : "Create Category"}
        </Typography>
        <div></div>
      </Stack>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box display={"flex"} justifyContent={"center"}>
        <Box width={"700px"}>
          <Box sx={{ mb: 3, maxWidth: "700px" }}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ mb: 0.5 }}>Category Name</Typography>
                <TextField
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Description</Typography>
                <TextField
                  placeholder="Enter category description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Thumbnail</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ width: 150 }}
                  >
                    Upload Thumbnail
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setThumbnailFile(e.target.files?.[0] || null)
                      }
                    />
                  </Button>
                  <TextField
                    placeholder="Or enter thumbnail URL"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Parent Category</Typography>
                <TextField
                  select
                  placeholder="Select parent category"
                  value={parentCategoryId}
                  onChange={(e) => setParentCategoryId(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">None</MenuItem>
                  {allCategories.map((c) => (
                    <MenuItem key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ mb: 3, maxWidth: "700px" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Custom Attributes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", gap: 2, mb: 1, px: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  Label
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  Data Type
                </Typography>
              </Box>
              <Box sx={{ width: 40 }}>
                {/* Empty space for delete button column */}
              </Box>
            </Box>

            <Stack spacing={0.5}>
              {attributes.map((attr) => (
                <Box key={attr.id} sx={{ borderColor: "divider", p: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Box sx={{ flex: 0.6 }}>
                        <TextField
                          placeholder="Enter attribute label"
                          value={attr.label}
                          onChange={(e) =>
                            handleAttrChange(attr.id, { label: e.target.value })
                          }
                          fullWidth
                          size="small"
                        />
                      </Box>
                      <Box sx={{ flex: 0.4 }}>
                        <TextField
                          select
                          placeholder="Select data type"
                          value={attr.type}
                          onChange={(e) =>
                            handleAttrChange(attr.id, {
                              type: e.target.value,
                              options: requiresOptions(e.target.value)
                                ? attr.options || []
                                : [],
                            })
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
                      </Box>
                      <Box>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveAttribute(attr.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {requiresOptions(attr.type) && (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          Options (comma separated)
                        </Typography>
                        <TextField
                          placeholder="Enter options separated by commas"
                          value={(attr.options || []).join(", ")}
                          onChange={(e) =>
                            handleAttrChange(attr.id, {
                              options: e.target.value
                                .split(",")
                                .map((x) => x.trim())
                                .filter(Boolean),
                            })
                          }
                          fullWidth
                          size="small"
                          helperText="Used for dropdown and radio"
                        />
                        <Stack
                          direction="row"
                          spacing={1}
                          mt={1}
                          flexWrap="wrap"
                        >
                          {(attr.options || []).map((opt) => (
                            <Chip key={opt} label={opt} size="small" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "end", pr: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAttribute}
                variant="outlined"
                size="small"
                sx={{
                  borderStyle: "dashed",
                  borderWidth: 1.5,
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderStyle: "solid",
                    backgroundColor: "primary.50",
                  },
                }}
              >
                Add New Attribute
              </Button>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            mt={5}
            display={"flex"}
            justifyContent={"space-between"}
            maxWidth={"700px"}
            pr={2}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setName("");
                setDescription("");
                setThumbnailFile(null);
                setThumbnailUrl("");
                setParentCategoryId("");
                setAttributes([emptyAttribute()]);
              }}
              color="warning"
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
                disabled={!name}
                size="small"
                sx={{ ml: 2 }}
              >
                {editId ? "Update Category" : "Save Category"}
              </Button>
            </div>
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Category Preview</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            {name || "Untitled Category"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {description || "No description"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {preparedAttributes.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attributes yet
              </Typography>
            )}
            {preparedAttributes.map((attr) => (
              <AttributePreview
                key={`${attr.label}-${attr.type}`}
                attribute={attr}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddCategory;
