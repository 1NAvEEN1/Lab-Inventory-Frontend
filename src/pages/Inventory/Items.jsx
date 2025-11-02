import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  Tooltip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ItemsService from "../../services/itemsService";
import FilesService from "../../services/filesService";
import { showAlertMessage } from "../../app/alertMessageController";

const Items = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
  });

  const observerRef = useRef();

  useEffect(() => {
    fetchItems(1, true);
  }, []);

  const fetchItems = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await ItemsService.getAll({
        search: searchTerm,
        categoryId: null,
        page,
        pageSize: pagination.pageSize,
      });

      if (response.data) {
        setItems((prev) =>
          reset ? response.data.data : [...prev, ...response.data.data]
        );
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError("Failed to fetch items");
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    fetchItems(1, true);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleView = (itemId) => {
    navigate(`/inventory/items/view-item/${itemId}`);
  };

  const handleInventory = (itemId) => {
    // Navigate to inventory page for this item
    navigate(`/inventory/items/inventory/${itemId}`);
  };

  // Infinite scroll observer
  const lastItemCallback = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage) {
          fetchItems(pagination.currentPage + 1, false);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loadingMore, pagination.hasNextPage, pagination.currentPage]
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Use FilesService to get the proper image URL
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
        <Button variant="outlined" onClick={() => fetchItems(1, true)}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Items
        </Typography>
        <Chip
          label={`${pagination.totalItems} Total`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Box sx={{ flexGrow: 1 }} />
        
        {/* View Toggle - Google Drive Style */}
        <Box
          sx={{
            display: "inline-flex",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Tooltip title="Grid view">
            <IconButton
              size="small"
              onClick={() => setViewMode("grid")}
              sx={{
                borderRadius: 0,
                backgroundColor:
                  viewMode === "grid" ? "action.selected" : "transparent",
                color: viewMode === "grid" ? "primary.main" : "text.secondary",
                "&:hover": {
                  backgroundColor:
                    viewMode === "grid" ? "action.selected" : "action.hover",
                },
                px: 1.5,
              }}
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="List view">
            <IconButton
              size="small"
              onClick={() => setViewMode("list")}
              sx={{
                borderRadius: 0,
                backgroundColor:
                  viewMode === "list" ? "action.selected" : "transparent",
                color: viewMode === "list" ? "primary.main" : "text.secondary",
                "&:hover": {
                  backgroundColor:
                    viewMode === "list" ? "action.selected" : "action.hover",
                },
                px: 1.5,
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Search Bar */}
        {/* row or gird toggle */}
        <Box sx={{ mb: 0 }}>
          <TextField
            fullWidth
            placeholder="Search items by name or SKU"
            value={searchTerm}
            size="small"
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <Button onClick={handleSearch} size="small">
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: "background.paper",width: 240 }}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/inventory/items/add-item")}
          // size="small"
        >
          Add Item
        </Button>
      </Stack>
      <Divider sx={{ mb: 3 }} />
      {/* Items Grid */}
      {items.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No items found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? "Try adjusting your search terms"
              : 'Click "Add Item" to create your first item'}
          </Typography>
          {!searchTerm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/inventory/items/add-item")}
            >
              Add Your First Item
            </Button>
          )}
        </Box>
      ) : (
        <>
          {viewMode === "grid" ? (
            // Grid View
            <Grid container spacing={2}>
              {items.map((item, index) => {
                const isLastItem = items.length === index + 1;
                const imageUrl = item.images?.[0]
                  ? getImageUrl(item.images[0])
                  : null;

                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={item.id}
                    ref={isLastItem ? lastItemCallback : null}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0px 5px rgba(0,0,0,0.2)",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      {/* Image Section */}
                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "60%",
                          backgroundColor: "grey.100",
                          overflow: "hidden",
                        }}
                      >
                        {imageUrl ? (
                          <CardMedia
                            component="img"
                            image={imageUrl}
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
                            <ImageIcon
                              sx={{ fontSize: 60, color: "grey.400" }}
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Content Section */}
                      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        ></Stack>
                        <Typography
                          variant="h6"
                          component="h2"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {item.name || "Untitled Item"}
                          {item.Category && (
                            <Chip
                              label={item.Category.name}
                              size="small"
                              // color="light"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1.5, fontWeight: 500 }}
                        >
                          SKU: {item.sku || "N/A"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "2.5em",
                          }}
                        >
                          {item.description || "No description available"}
                        </Typography>
                      </CardContent>

                      {/* Actions */}
                      <CardActions
                        sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => handleView(item.id)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<InventoryIcon />}
                          onClick={() => handleInventory(item.id)}
                          sx={{ boxShadow: "none" }}
                        >
                          Inventory
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            // Table View
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600, width: 80 }}>
                      Image
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 150 }}>
                      SKU
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 150 }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, minWidth: 250 }}>
                      Description
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, width: 200 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => {
                    const isLastItem = items.length === index + 1;
                    const imageUrl = item.images?.[0]
                      ? getImageUrl(item.images[0])
                      : null;

                    return (
                      <TableRow
                        key={item.id}
                        ref={isLastItem ? lastItemCallback : null}
                        sx={{
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                          cursor: "pointer",
                        }}
                        onClick={() => handleView(item.id)}
                      >
                        {/* Image */}
                        <TableCell>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              backgroundColor: "grey.100",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            {imageUrl ? (
                              <Box
                                component="img"
                                src={imageUrl}
                                alt={item.name}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <ImageIcon
                                sx={{ fontSize: 30, color: "grey.400" }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name || "Untitled Item"}
                          </Typography>
                        </TableCell>

                        {/* SKU */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {item.sku || "N/A"}
                          </Typography>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          {item.Category ? (
                            <Chip
                              label={item.Category.name}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.description || "No description available"}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(item.id);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<InventoryIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInventory(item.id);
                              }}
                              sx={{ boxShadow: "none" }}
                            >
                              Inventory
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              py={4}
            >
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Loading more items...
              </Typography>
            </Box>
          )}

          {/* End of List Indicator */}
          {!pagination.hasNextPage && items.length > 0 && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                All items loaded.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Items;
