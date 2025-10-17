import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Autocomplete,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  alpha,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import CategoriesService from "../services/categoriesService";
import { useTheme } from "@mui/material/styles";

// Flatten tree structure for search
const flattenTree = (nodes, level = 0) => {
  const result = [];
  nodes.forEach((node) => {
    result.push({
      ...node,
      level,
      searchText: node.name?.toLowerCase() || "",
    });
    if (Array.isArray(node.children) && node.children.length > 0) {
      result.push(...flattenTree(node.children, level + 1));
    }
  });
  return result;
};

// Render tree nodes for dropdown
const renderTreeNodes = (nodes, level = 0, onNodeClick, selectedValue) => {
  const theme = useTheme();
  return nodes.map((node) => {
    const hasChildren =
      Array.isArray(node.children) && node.children.length > 0;
    const isSelected = selectedValue && String(node.id || node._id) === String(selectedValue);
    
    return (
      <TreeItem
        key={node.id || node._id}
        itemId={String(node.id || node._id)}
        label={
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick && onNodeClick(node);
            }}
            sx={{
              width: "100%",
              cursor: "pointer",
            //   backgroundColor: isSelected ? theme.palette.primary.main : "transparent",
              color: isSelected ? theme.palette.primary.main: "inherit",
              borderRadius: 1,
              px: 0,
              py: 0.5,
              mx: 0.5,
            //   "&:hover": {
            //     backgroundColor: isSelected 
            //       ? theme.palette.primary.dark
            //       : "action.hover",
            //   },
            }}
          >
            {node.name || "Untitled"}
          </Box>
        }
        sx={{
          [`& .${treeItemClasses.content}`]: {
            minHeight: 32,
            bgcolor: theme.palette.grey[200],
            mb: 0.5,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          },
          [`& .${treeItemClasses.label}`]: {
            fontSize: "0.875rem",
            fontWeight: level === 0 ? 500 : 400,
            padding: 0,
          },
          "&:before": {
            pointerEvents: "none",
            content: '""',
            position: "absolute",
            width: 16,
            left: -16,
            top: 18,
          },
          [`& .${treeItemClasses.groupTransition}`]: {
            marginLeft: 2,
            paddingLeft: 0,
            position: "relative",
          },
        }}
      >
        {hasChildren
          ? renderTreeNodes(node.children, level + 1, onNodeClick, selectedValue)
          : null}
      </TreeItem>
    );
  });
};

const ParentCategorySelector = ({
  value,
  onChange,
  error,
  helperText,
  disabled,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");

  // Load categories tree
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setErrorState(null);
        const { data } = await CategoriesService.getTree();
        if (!isMounted) return;
        const arr = Array.isArray(data) ? data : [];
        console.log("Original nodes from API:", arr);
        setNodes(arr);
      } catch (e) {
        if (!isMounted) return;
        setErrorState("Failed to load categories");
        console.error("ParentCategorySelector load error", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Flatten tree for search
  const flatNodes = useMemo(() => {
    const flattened = flattenTree(nodes);
    console.log("Flat nodes:", flattened);
    return flattened;
  }, [nodes]);

  // Filter nodes based on search input
  const filteredNodes = useMemo(() => {
    if (!inputValue.trim()) return nodes;

    const searchTerm = inputValue.toLowerCase();
    const filtered = flatNodes.filter((node) =>
      node.searchText.includes(searchTerm)
    );

    // Rebuild tree structure from filtered nodes
    const nodeMap = new Map();
    const rootNodes = [];

    filtered.forEach((node) => {
      nodeMap.set(node.id || node._id, { ...node, children: [] });
    });

    filtered.forEach((node) => {
      const nodeObj = nodeMap.get(node.id || node._id);
      const parentKey = node.parentCategoryId || node.parentId;
      if (parentKey && nodeMap.has(parentKey)) {
        nodeMap.get(parentKey).children.push(nodeObj);
      } else {
        rootNodes.push(nodeObj);
      }
    });

    return rootNodes;
  }, [nodes, flatNodes, inputValue]);

  // Get selected node
  const selectedNode = useMemo(() => {
    console.log("Calculating selectedNode:", {
      value,
      flatNodesLength: flatNodes.length,
    });
    if (!value) return null;
    const found =
      flatNodes.find((node) => String(node.id || node._id) === String(value)) || null;
    console.log("Found selectedNode:", found);
    return found;
  }, [flatNodes, value]);

  // Update display value when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setDisplayValue(selectedNode.name || "");
      setInputValue("");
    } else {
      setDisplayValue("");
    }
  }, [selectedNode]);

  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue ? String(newValue.id || newValue._id) : null);
    }
    // Clear input value when selection is made
    if (newValue) {
      setInputValue("");
    }
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    setDisplayValue(newValue);
  };

  const handleTreeNodeClick = (node) => {
    console.log("Tree node clicked:", node);
    if (onChange) {
      console.log("Calling onChange with ID:", String(node.id || node._id));
      onChange(String(node.id || node._id));
    }
    setInputValue("");
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest("[data-parent-category-selector]")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading categories...</Typography>
      </Box>
    );
  }

  if (errorState) {
    return (
      <Alert severity="error" sx={{ my: 1 }}>
        {errorState}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: "relative" }} data-parent-category-selector>
      <TextField
        placeholder="Search and select parent category"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        error={error}
        helperText={helperText}
        size="small"
        fullWidth
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
            </>
          ),
        }}
      />

      {open && (
        <Paper
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: "auto",
            mt: 1,
            boxShadow: 3,
          }}
        >
          {inputValue.trim() ? (
            <Box>
              {flatNodes
                .filter((node) =>
                  node.name?.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((node) => {
                  const isSelected = value && String(node.id || node._id) === String(value);
                  return (
                    <Box
                      key={node.id || node._id}
                      onClick={() => {
                        console.log("Search result clicked:", node);
                        handleTreeNodeClick(node);
                      }}
                      sx={{
                        paddingLeft: `${1 + (node.level || 0) * 2}rem`,
                        paddingY: 1,
                        paddingX: 2,
                        fontSize: "0.875rem",
                        fontWeight: node.level === 0 ? 500 : 400,
                        cursor: "pointer",
                        backgroundColor: isSelected ? "primary.main" : "transparent",
                        color: isSelected ? "primary.contrastText" : "inherit",
                        borderRadius: 1,
                        mx: 1,
                        "&:hover": {
                          backgroundColor: isSelected ? "primary.dark" : "action.hover",
                        },
                      }}
                    >
                      {node.name || "Untitled"}
                    </Box>
                  );
                })}
            </Box>
          ) : (
            <SimpleTreeView
              defaultExpandedItems={flatNodes.map((node) => String(node.id || node._id))}
              sx={{
                "& .MuiTreeItem-content": {
                  padding: 0.5,
                },
                "& .MuiTreeItem-label": {
                  fontSize: "0.875rem",
                },
              }}
            >
              {renderTreeNodes(nodes, 0, handleTreeNodeClick, value)}
            </SimpleTreeView>
          )}
        </Paper>
      )}
    </Box>
  );
};

ParentCategorySelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
};

ParentCategorySelector.defaultProps = {
  value: null,
  onChange: undefined,
  error: false,
  helperText: "",
  disabled: false,
};

export default ParentCategorySelector;