import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import AttributeInput from "../../components/Attributes/AttributeInput";
import CategoriesService from "../../services/categoriesService";
import ItemsService from "../../services/itemsService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";

const AddItem = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [itemName, setItemName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [imageFiles, setImageFiles] = useState([]);
  const [fileFiles, setFileFiles] = useState([]);

  const [attributeValues, setAttributeValues] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    CategoriesService.getAll()
      .then(({ data }) => setCategories(data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (editId) {
      fetchItem();
    }
  }, [editId]);

  const fetchItem = async () => {
    try {
      const response = await ItemsService.getById(editId);
      const item = response.data;
      setItemName(item.name || "");
      setSku(item.sku || "");
      setDescription(item.description || "");
      setSelectedCategoryId(item.categoryId || "");
      // Set other fields as needed
    } catch (err) {
      showAlertMessage({ message: "Failed to fetch item", type: "error" });
      console.error("Error fetching item:", err);
    }
  };

  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedCategory(null);
      setAttributeValues({});
      return;
    }
    CategoriesService.getById(selectedCategoryId)
      .then(({ data }) => {
        setSelectedCategory(data);
        const next = {};
        (data?.attributes || []).forEach((a) => {
          next[a.label] = null;
        });
        setAttributeValues(next);
      })
      .catch(() => {
        setSelectedCategory(null);
      });
  }, [selectedCategoryId]);

  const handleAttrChange = (label, value) => {
    setAttributeValues((prev) => ({ ...prev, [label]: value }));
  };

  const uploadMany = async (files) => {
    const uploads = Array.from(files || []).map((f) => FilesService.upload(f).then((r) => r.data?.url || r.data?.path || r.data));
    return Promise.all(uploads);
  };

  const handleSave = async () => {
    try {
      const imageUrls = await uploadMany(imageFiles);
      const fileUrls = await uploadMany(fileFiles);

      const attributesPayload = (selectedCategory?.attributes || []).map((a) => ({
        label: a.label,
        type: a.type,
        value: attributeValues[a.label] ?? null,
      }));

      const payload = {
        name: itemName,
        sku,
        description,
        categoryId: selectedCategoryId || null,
        images: imageUrls,
        files: fileUrls,
        attributes: attributesPayload,
      };

      if (editId) {
        await ItemsService.update(editId, payload);
        showAlertMessage({ message: "Item updated successfully", type: "success" });
      } else {
        await ItemsService.save(payload);
        showAlertMessage({ message: "Item created successfully", type: "success" });
      }

      navigate("/inventory/items");
    } catch (e) {
      showAlertMessage({ 
        message: editId ? "Failed to update item" : "Failed to create item", 
        type: "error" 
      });
    }
  };

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent={"space-between"} spacing={2} sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/items")}
          color="primary"
        >
          Back
        </Button>
        <Typography variant="h5" gutterBottom>
          {editId ? "Edit Item" : "Create Item"}
        </Typography>
        <div></div>
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
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Category</Typography>
                <TextField
                  select
                  placeholder="Select category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
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
                />
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Images</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ width: 150 }}
                  >
                    Upload Images
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImageFiles(e.target.files)}
                    />
                  </Button>
                  <Box sx={{ flex: 1 }}>
                    {(imageFiles?.length || 0) > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {Array.from(imageFiles).map((f) => (
                          <Chip key={f.name + f.size} label={f.name} size="small" />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ mb: 0.5 }}>Files</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ width: 150 }}
                  >
                    Upload Files
                    <input
                      hidden
                      type="file"
                      multiple
                      onChange={(e) => setFileFiles(e.target.files)}
                    />
                  </Button>
                  <Box sx={{ flex: 1 }}>
                    {(fileFiles?.length || 0) > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {Array.from(fileFiles).map((f) => (
                          <Chip key={f.name + f.size} label={f.name} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {selectedCategory && (
            <Box sx={{ mb: 3, maxWidth: "700px" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedCategory.name} Attributes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {(selectedCategory.attributes || []).map((attr) => (
                  <Box key={attr.label + attr.type} sx={{ borderColor: "divider", p: 1 }}>
                    <AttributeInput
                      attribute={attr}
                      value={attributeValues[attr.label]}
                      onChange={(val) => handleAttrChange(attr.label, val)}
                    />
                  </Box>
                ))}
              </Stack>
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
            <Button
              variant="outlined"
              onClick={() => {
                setItemName("");
                setSku("");
                setDescription("");
                setSelectedCategoryId("");
                setSelectedCategory(null);
                setImageFiles([]);
                setFileFiles([]);
                setAttributeValues({});
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
                disabled={!itemName}
                size="small"
                sx={{ ml: 2 }}
              >
                {editId ? "Update Item" : "Save Item"}
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
            {selectedCategory && (selectedCategory.attributes || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No attributes for this category
              </Typography>
            )}
            {selectedCategory && (selectedCategory.attributes || []).map((a) => (
              <Box key={a.label + a.type}>
                <Typography variant="caption" color="text.secondary">
                  {a.label}
                </Typography>
                <Typography variant="body2">{String(attributeValues[a.label] ?? "—")}</Typography>
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
    </Box>
  );
};

export default AddItem;
