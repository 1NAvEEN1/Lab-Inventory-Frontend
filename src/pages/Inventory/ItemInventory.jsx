import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Inventory2 as InventoryIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ItemInventoryService from "../../services/itemInventoryService";
import ItemsService from "../../services/itemsService";
import { showAlertMessage } from "../../app/alertMessageController";
import ParentLocationSelector from "../../components/ParentLocationSelector";
import AttributesInput from "../../components/AttributesInput";
import FilesService from "../../services/filesService";

const QUANTITY_TYPES = ["kg", "g", "L", "mL", "pcs", "boxes", "units"];

const ItemInventory = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const [item, setItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' or 'edit'
  const [editingInventory, setEditingInventory] = useState(null);

  // Adjust dialog states
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustingInventory, setAdjustingInventory] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  // Form states
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityType, setQuantityType] = useState("pcs");
  const [attributes, setAttributes] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchItemAndInventory();
    }
  }, [itemId]);

  const fetchItemAndInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch item details
      const itemResponse = await ItemsService.getById(itemId);
      setItem(itemResponse.data);

      // Fetch inventory for this item
      const inventoryResponse = await ItemInventoryService.getByItem(itemId);
      setInventory(inventoryResponse.data.inventory || []);
      setTotals(inventoryResponse.data.totals || {});
    } catch (err) {
      setError("Failed to fetch item inventory");
      console.error("Error fetching item inventory:", err);
      showAlertMessage({
        message: "Failed to fetch item inventory",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode = "create", inventoryRecord = null) => {
    setDialogMode(mode);
    setEditingInventory(inventoryRecord);

    if (mode === "edit" && inventoryRecord) {
      setSelectedLocationId(String(inventoryRecord.locationId));
      setQuantity(inventoryRecord.quantity);
      setQuantityType(inventoryRecord.quantityType);
      setAttributes(inventoryRecord.attributes || {});
    } else {
      // Reset form for create mode
      setSelectedLocationId("");
      setQuantity("");
      setQuantityType("pcs");
      setAttributes({});
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInventory(null);
    setSelectedLocationId("");
    setQuantity("");
    setQuantityType("pcs");
    setAttributes({});
  };

  const handleOpenAdjustDialog = (inventoryRecord) => {
    setAdjustingInventory(inventoryRecord);
    setAdjustmentAmount("");
    setAdjustmentReason("");
    setAdjustDialogOpen(true);
  };

  const handleCloseAdjustDialog = () => {
    setAdjustDialogOpen(false);
    setAdjustingInventory(null);
    setAdjustmentAmount("");
    setAdjustmentReason("");
  };

  const handleSave = async () => {
    if (!selectedLocationId || !quantity || !quantityType) {
      showAlertMessage({
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        itemId: Number(itemId),
        locationId: Number(selectedLocationId),
        quantity: parseFloat(quantity),
        quantityType: quantityType,
        attributes: Object.keys(attributes).length > 0 ? attributes : null,
      };

      if (dialogMode === "edit") {
        await ItemInventoryService.update(editingInventory.id, payload);
        showAlertMessage({
          message: "Inventory updated successfully",
          type: "success",
        });
      } else {
        await ItemInventoryService.save(payload);
        showAlertMessage({
          message: "Inventory added successfully",
          type: "success",
        });
      }

      handleCloseDialog();
      fetchItemAndInventory(); // Refresh the list
    } catch (err) {
      showAlertMessage({
        message: err.response?.data?.error || "Failed to save inventory",
        type: "error",
      });
      console.error("Error saving inventory:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (inventoryId) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) {
      return;
    }

    try {
      await ItemInventoryService.delete(inventoryId);
      showAlertMessage({
        message: "Inventory deleted successfully",
        type: "success",
      });
      fetchItemAndInventory(); // Refresh the list
    } catch (err) {
      showAlertMessage({
        message: "Failed to delete inventory",
        type: "error",
      });
      console.error("Error deleting inventory:", err);
    }
  };

  const handleAdjust = async () => {
    if (!adjustmentAmount || parseFloat(adjustmentAmount) === 0) {
      showAlertMessage({
        message: "Please enter a valid adjustment amount",
        type: "error",
      });
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        adjustment: parseFloat(adjustmentAmount),
        reason: adjustmentReason || undefined,
      };

      await ItemInventoryService.adjust(adjustingInventory.id, payload);
      showAlertMessage({
        message: "Inventory adjusted successfully",
        type: "success",
      });
      handleCloseAdjustDialog();
      fetchItemAndInventory(); // Refresh the list
    } catch (err) {
      showAlertMessage({
        message: err.response?.data?.error || "Failed to adjust inventory",
        type: "error",
      });
      console.error("Error adjusting inventory:", err);
    } finally {
      setFormLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return FilesService.getImageUrl("items", imagePath);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={fetchItemAndInventory}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!item) {
    return (
      <Box p={3}>
        <Alert severity="warning">Item not found</Alert>
      </Box>
    );
  }

  const imageUrl = item.images?.[0] ? getImageUrl(item.images[0]) : null;

  return (
    <Box sx={{ p: 1, pt: 0 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/inventory/items")}
          color="primary"
          size="small"
        >
          Back to Items
        </Button>
        <Typography variant="h6">Item Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
          size="small"
        >
          Add Location
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Item Summary Card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Item Image */}
            <Grid item xs={12} sm={2}>
              <Box
                sx={{
                  width: "100%",
                  paddingTop: "100%",
                  position: "relative",
                  backgroundColor: "grey.100",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={item.name}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <InventoryIcon sx={{ fontSize: 60, color: "grey.400" }} />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Item Details */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {item.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip label={`SKU: ${item.sku || "N/A"}`} size="small" />
                {item.Category && (
                  <Chip
                    label={item.Category.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {item.description || "No description available"}
              </Typography>
            </Grid>

            {/* Total Quantities */}
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Total Inventory
                </Typography>
                {Object.keys(totals).length > 0 ? (
                  <Stack spacing={0.5}>
                    {Object.entries(totals).map(([type, total]) => (
                      <Typography key={type} variant="h6" fontWeight={600}>
                        {parseFloat(total).toLocaleString()} {type}
                      </Typography>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2">No inventory records</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <InventoryIcon sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inventory locations found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add locations to track where this item is stored
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog("create")}
          >
            Add First Location
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Path</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 150 }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100 }}>
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Attributes</TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, width: 250 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  {/* Location Name */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon color="action" fontSize="small" />
                      <Typography variant="body1" fontWeight={600}>
                        {record.Location?.name || "Unknown"}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Location Path */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {record.Location?.path || "—"}
                    </Typography>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell>
                    <Typography variant="h6" fontWeight={600}>
                      {parseFloat(record.quantity).toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Quantity Type */}
                  <TableCell>
                    <Chip
                      label={record.quantityType}
                      size="small"
                      color="default"
                    />
                  </TableCell>

                  {/* Attributes */}
                  <TableCell>
                    {record.attributes && Object.keys(record.attributes).length > 0 ? (
                      <Stack spacing={0.5}>
                        {Object.entries(record.attributes).map(([key, value]) => {
                          // Skip adjustment history from display
                          if (key === "adjustmentHistory") return null;
                          return (
                            <Typography
                              key={key}
                              variant="caption"
                              color="text.secondary"
                            >
                              <strong>{key}:</strong> {String(value)}
                            </Typography>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Adjust Quantity">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TrendingUpIcon />}
                          onClick={() => handleOpenAdjustDialog(record)}
                        >
                          Adjust
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog("edit", record)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(record.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "edit" ? "Edit Inventory" : "Add Inventory Location"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            {/* Location Selector */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Location <span style={{ color: "red" }}>*</span>
              </Typography>
              <ParentLocationSelector
                value={selectedLocationId}
                onChange={setSelectedLocationId}
                disabled={formLoading || dialogMode === "edit"}
                label="Select Location"
              />
            </Box>

            {/* Quantity */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Quantity <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.001 }}
                disabled={formLoading}
              />
            </Box>

            {/* Quantity Type */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Quantity Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={quantityType}
                  onChange={(e) => setQuantityType(e.target.value)}
                  disabled={formLoading}
                >
                  {QUANTITY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Attributes */}
            <Box>
              <AttributesInput
                value={attributes}
                onChange={setAttributes}
                disabled={formLoading}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={formLoading}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={formLoading || !selectedLocationId || !quantity || !quantityType}
            startIcon={<SaveIcon />}
          >
            {formLoading ? "Saving..." : dialogMode === "edit" ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Quantity Dialog */}
      <Dialog
        open={adjustDialogOpen}
        onClose={handleCloseAdjustDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Adjust Inventory Quantity
        </DialogTitle>
        <DialogContent>
          {adjustingInventory && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Location:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {adjustingInventory.Location?.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Current Quantity:
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {parseFloat(adjustingInventory.quantity).toLocaleString()}{" "}
                      {adjustingInventory.quantityType}
                    </Typography>
                  </Stack>
                  {adjustmentAmount && parseFloat(adjustmentAmount) !== 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        New Quantity:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={
                          parseFloat(adjustmentAmount) > 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {(
                          parseFloat(adjustingInventory.quantity) +
                          parseFloat(adjustmentAmount)
                        ).toLocaleString()}{" "}
                        {adjustingInventory.quantityType}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}

          <Stack spacing={2.5}>
            {/* Adjustment Amount */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Adjustment Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                type="number"
                placeholder="Enter adjustment (use negative for reduction)"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ step: 0.001 }}
                disabled={formLoading}
                helperText="Use positive values to add, negative values to subtract"
              />
            </Box>

            {/* Quick Adjustment Buttons */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Quick Adjust:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setAdjustmentAmount("10")}
                  disabled={formLoading}
                >
                  +10
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setAdjustmentAmount("5")}
                  disabled={formLoading}
                >
                  +5
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setAdjustmentAmount("1")}
                  disabled={formLoading}
                >
                  +1
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setAdjustmentAmount("-1")}
                  disabled={formLoading}
                >
                  -1
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setAdjustmentAmount("-5")}
                  disabled={formLoading}
                >
                  -5
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setAdjustmentAmount("-10")}
                  disabled={formLoading}
                >
                  -10
                </Button>
              </Stack>
            </Box>

            {/* Reason */}
            <Box>
              <Typography sx={{ mb: 1 }} variant="body2" fontWeight={500}>
                Reason (Optional)
              </Typography>
              <TextField
                placeholder="Enter reason for adjustment (e.g., Lab Experiment, Restocking, Correction)"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
                disabled={formLoading}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseAdjustDialog}
            disabled={formLoading}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdjust}
            variant="contained"
            disabled={
              formLoading ||
              !adjustmentAmount ||
              parseFloat(adjustmentAmount) === 0
            }
            startIcon={<SaveIcon />}
            color={parseFloat(adjustmentAmount) > 0 ? "success" : "primary"}
          >
            {formLoading ? "Adjusting..." : "Apply Adjustment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemInventory;
