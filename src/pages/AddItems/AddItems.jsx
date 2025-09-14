import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
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
import AttributeInput from "../../components/Attributes/AttributeInput";
import CategoriesService from "../../services/categoriesService";
import ItemsService from "../../services/itemsService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";

const AddItems = () => {
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

      await ItemsService.save(payload);
      showAlertMessage({ message: "Item created", type: "success" });

      // reset
      setItemName("");
      setSku("");
      setDescription("");
      setSelectedCategoryId("");
      setSelectedCategory(null);
      setImageFiles([]);
      setFileFiles([]);
      setAttributeValues({});
    } catch (e) {
      showAlertMessage({ message: "Failed to create item", type: "error" });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
        <Card>
          <CardHeader title="Create Item" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} fullWidth />
              <TextField label="SKU (serial number)" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth />
              <TextField
                select
                label="Category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id || c.id} value={c._id || c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" component="label">
                  Upload Images
                  <input hidden type="file" accept="image/*" multiple onChange={(e) => setImageFiles(e.target.files)} />
                </Button>
                <Button variant="outlined" component="label">
                  Upload Files
                  <input hidden type="file" multiple onChange={(e) => setFileFiles(e.target.files)} />
                </Button>
              </Stack>
              {(imageFiles?.length || 0) > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Array.from(imageFiles).map((f) => (
                    <Chip key={f.name + f.size} label={f.name} />
                  ))}
                </Stack>
              )}
              {(fileFiles?.length || 0) > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Array.from(fileFiles).map((f) => (
                    <Chip key={f.name + f.size} label={f.name} variant="outlined" />
                  ))}
                </Stack>
              )}

              {selectedCategory && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedCategory.name} attributes
                  </Typography>
                  <Stack spacing={2}>
                    {(selectedCategory.attributes || []).map((attr) => (
                      <AttributeInput
                        key={attr.label + attr.type}
                        attribute={attr}
                        value={attributeValues[attr.label]}
                        onChange={(val) => handleAttrChange(attr.label, val)}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSave} disabled={!itemName}>
                  Save Item
                </Button>
                <Button variant="outlined" onClick={() => setPreviewOpen(true)}>
                  Preview
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Item Preview</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" gutterBottom>
            {itemName || "Untitled item"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            SKU: {sku || "—"}
          </Typography>
          {selectedCategory && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category: {selectedCategory.name}
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          {selectedCategory && (
            <Stack spacing={1}>
              {(selectedCategory.attributes || []).map((a) => (
                <Box key={a.label + a.type}>
                  <Typography variant="caption" color="text.secondary">
                    {a.label}
                  </Typography>
                  <Typography variant="body2">{String(attributeValues[a.label] ?? "")}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AddItems;

