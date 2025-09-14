import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CategoriesService from "../../services/categoriesService";
import { showAlertMessage } from "../../app/alertMessageController";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoriesService.getAll();
      setCategories(response?.data || []);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await CategoriesService.delete(categoryId);
        showAlertMessage({ message: "Category deleted successfully", type: "success" });
        fetchCategories();
      } catch (err) {
        showAlertMessage({ message: "Failed to delete category", type: "error" });
        console.error("Error deleting category:", err);
      }
    }
  };

  const handleEdit = (categoryId) => {
    navigate(`/inventory/categories/add-category?edit=${categoryId}`);
  };

  const handleView = (categoryId) => {
    navigate(`/inventory/categories/${categoryId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
        <Button variant="outlined" onClick={fetchCategories}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
       {/* Header */}
       <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
         <Typography variant="h4" component="h1">
           Categories
         </Typography>
         <Box sx={{ flexGrow: 1 }} />
         <Button
           variant="contained"
           startIcon={<AddIcon />}
           onClick={() => navigate("/inventory/categories/add-category")}
         >
           Add Category
         </Button>
       </Stack>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Attributes</TableCell>
              <TableCell>Items Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No categories found. Click "Add Category" to create your first category.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id || category.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {category.name || "Untitled Category"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.description || "No description"}
                    </Typography>
                  </TableCell>
                   <TableCell>
                     <Stack direction="row" spacing={0.5} flexWrap="wrap">
                       {(() => {
                         const attributes = category?.attributes || [];
                         const attributesArray = Array.isArray(attributes) ? attributes : Object.keys(attributes);
                         const displayAttributes = attributesArray.slice(0, 3);
                         
                         return (
                           <>
                             {displayAttributes.map((attr, index) => {
                               const label = typeof attr === 'string' ? attr : attr.label || attr;
                               return (
                                 <Chip
                                   key={index}
                                   label={label}
                                   size="small"
                                   variant="outlined"
                                   color="secondary"
                                 />
                               );
                             })}
                             {attributesArray.length > 3 && (
                               <Chip
                                 label={`+${attributesArray.length - 3} more`}
                                 size="small"
                                 variant="outlined"
                                 color="default"
                               />
                             )}
                           </>
                         );
                       })()}
                     </Stack>
                   </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.itemsCount || 0} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(category._id || category.id)}
                        color="primary"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(category._id || category.id)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category._id || category.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Categories;
