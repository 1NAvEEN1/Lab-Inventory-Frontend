import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AttributePreview from "../../components/Attributes/AttributePreview";
import { ATTRIBUTE_TYPES, requiresOptions } from "../../components/Attributes/types";
import CategoriesService from "../../services/categoriesService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";
import { useNavigate } from "react-router-dom";

const emptyAttribute = () => ({ id: crypto.randomUUID(), label: "", type: "text", options: [] });

const CreateCategory = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [attributes, setAttributes] = useState([emptyAttribute()]);

  React.useEffect(() => {
    CategoriesService.getAll().then(({ data }) => setAllCategories(data || [])).catch(() => {});
  }, []);

  const handleAddAttribute = () => setAttributes((prev) => [...prev, emptyAttribute()]);
  const handleRemoveAttribute = (id) => setAttributes((prev) => prev.filter((a) => a.id !== id));
  const handleAttrChange = (id, patch) =>
    setAttributes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

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
      await CategoriesService.save(payload);
      showAlertMessage({ message: "Category created", type: "success" });
      navigate("/add-items");
    } catch (e) {
      showAlertMessage({ message: "Failed to create category", type: "error" });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card>
          <CardHeader title="Create Category" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Category Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" component="label">
                  Upload Thumbnail
                  <input hidden type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                </Button>
                <TextField label="Thumbnail URL (optional)" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} fullWidth />
              </Stack>

              <TextField select label="Parent Category" value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)} fullWidth>
                <MenuItem value="">None</MenuItem>
                {allCategories.map((c) => (
                  <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Box mt={3}>
          <Card>
            <CardHeader
              title="Custom Attributes"
              action={
                <Button startIcon={<AddIcon />} onClick={handleAddAttribute} variant="contained">
                  Add Attribute
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {attributes.map((attr) => (
                  <Card key={attr.id} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                          <TextField
                            label="Label"
                            value={attr.label}
                            onChange={(e) => handleAttrChange(attr.id, { label: e.target.value })}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <TextField
                            select
                            label="Data Type"
                            value={attr.type}
                            onChange={(e) => handleAttrChange(attr.id, { type: e.target.value, options: requiresOptions(e.target.value) ? (attr.options || []) : [] })}
                            fullWidth
                          >
                            {ATTRIBUTE_TYPES.map((t) => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <IconButton color="error" onClick={() => handleRemoveAttribute(attr.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>

                        {requiresOptions(attr.type) && (
                          <Grid item xs={12}>
                            <TextField
                              label="Options (comma separated)"
                              value={(attr.options || []).join(", ")}
                              onChange={(e) => handleAttrChange(attr.id, { options: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}
                              fullWidth
                              helperText="Used for dropdown and radio"
                            />
                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                              {(attr.options || []).map((opt) => (
                                <Chip key={opt} label={opt} size="small" />
                              ))}
                            </Stack>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Stack direction="row" spacing={2} mt={3}>
          <Button variant="contained" onClick={handleSave} disabled={!name}>
            Save Category
          </Button>
          <Button variant="text" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={12} md={5}>
        <Card>
          <CardHeader title="Preview" />
          <Divider />
          <CardContent>
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
                <AttributePreview key={`${attr.label}-${attr.type}`} attribute={attr} />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreateCategory;


