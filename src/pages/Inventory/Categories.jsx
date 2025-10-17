import React from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CategoriesTree from "../../components/CategoriesTree";
import { showAlertMessage } from "../../app/alertMessageController";
import CategoriesService from "../../services/categoriesService";

const Categories = () => {
  const navigate = useNavigate();

  const handleView = (categoryId) => {
    navigate(`/inventory/categories/view-category/${categoryId}`);
  };

  const handleAdd = (categoryId) => {
    navigate(`/inventory/categories/add-category?parent=${categoryId}`);
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1">
          Categories
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/inventory/categories/add-category")}
          size="small"
        >
          Add Category
        </Button>
      </Stack>

      {/* Categories Tree - modern minimal */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          bgcolor: "#efefef",
          height: { sx: "calc(100vh - 100px)", md: "calc(100vh - 145px)" },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box width={"100%"} maxWidth={"100%"}>
          <CategoriesTree
            defaultExpandedIds={[]}
            onView={(id) => handleView(id)}
            onAdd={(id) => handleAdd(id)}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default Categories;
