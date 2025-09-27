import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  Typography,
  IconButton,
  Stack,
  styled,
  alpha,
  Chip,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import CategoriesService from "../services/categoriesService";
import useResponsive from "../hooks/useResponsive";
import {
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from "@mui/icons-material";

// Tree node label with ellipsis and tooltip
function EllipsisLabel({ text, description, attributes, itemsCount }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={text} placement="right" arrow>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
              fontWeight: "medium",
            }}
          >
            {text}
          </Typography>
        </Tooltip>
        {/* {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {description}
          </Typography>
        )} */}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {/* {attributes && attributes.length > 0 && (
          <Chip
            label={`${attributes.length} attr${attributes.length > 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        )}
        <Chip
          label={`${itemsCount || 0} items`}
          size="small"
          variant="outlined"
          color="default"
          sx={{ fontSize: '0.7rem', height: 20 }}
        /> */}
      </Box>
    </Box>
  );
}

EllipsisLabel.propTypes = {
  text: PropTypes.string.isRequired,
  description: PropTypes.string,
  attributes: PropTypes.array,
  itemsCount: PropTypes.number,
};

// Custom styled TreeItem component
const CustomTreeItem = styled(TreeItem)(({ theme, isRootNode }) => ({
  // Compact density + modern minimal styling
  position: "relative",
  [`& .${treeItemClasses.content}`]: {
    minHeight: 35,
    borderRadius: 5,
    backgroundColor: alpha(theme.palette.grey[50], 1),
    marginBottom: 3,
    padding: "4px 8px",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${treeItemClasses.label}`]: {
    py: 0,
    my: 0,
    width: "100%",
  },

  "&:before": {
    pointerEvents: "none",
    content: '""',
    position: "absolute",
    width: 16,
    left: -16,
    top: 18,
    borderBottom:
      // only display if the TreeItem is not root node
      !isRootNode
        ? `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
        : "none",
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 16,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: 0,
      bottom: "50%",
      width: 1,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
  },
  ...theme.applyStyles("light", {
    color: theme.palette.grey[800],
  }),
}));

/**
 * CategoriesTree
 * - Fetches categories from backend on mount and transforms them into a tree structure
 * - Controlled selection via selectedId/onSelect
 * - Internal expanded state with defaultExpandedIds
 * - Compact density styling, tooltips for long names
 */
export default function CategoriesTree({
  selectedId,
  onSelect,
  defaultExpandedIds,
  onView,
  onAdd,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [expandedIds, setExpandedIds] = useState(
    () => defaultExpandedIds || []
  );
  const isDesktop = useResponsive("up", "md");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await CategoriesService.getTree();
        if (!isMounted) return;
        const arr = Array.isArray(data) ? data : [];
        setNodes(arr);
      } catch (e) {
        if (!isMounted) return;
        setError("Failed to load categories");
        // eslint-disable-next-line no-console
        console.error("CategoriesTree load error", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedItems = useMemo(
    () => (selectedId ? [String(selectedId)] : []),
    [selectedId]
  );

  // Collect all ids to expand entire tree on desktop
  const collectAllIds = (items, acc = []) => {
    items.forEach((n) => {
      const id = String(n._id || n.id);
      acc.push(id);
      if (Array.isArray(n.children) && n.children.length)
        collectAllIds(n.children, acc);
    });
    return acc;
  };

  useEffect(() => {
    if (isDesktop && nodes.length) {
      const all = collectAllIds(nodes, []);
      setExpandedIds(all);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, nodes]);

  const renderNodes = (items, isRootLevel = false) => {
    return items.map((n) => {
      const id = String(n._id || n.id);
      const attributes = n?.attributes || [];
      const attributesArray = Array.isArray(attributes) ? attributes : Object.keys(attributes);
      
      const label = (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <EllipsisLabel 
            text={n.name || "Untitled Category"} 
            description={n.description}
            attributes={attributesArray}
            itemsCount={n.itemsCount}
          />
          <Stack
            direction="row"
            spacing={0.5}
            onClick={(e) => e.stopPropagation()}
          >
            {onView && (
              <IconButton
                size="small"
                aria-label="View"
                onClick={() => onView(id, n)}
              >
                <VisibilityIcon fontSize="inherit" />
              </IconButton>
            )}
            {onAdd && (
              <IconButton
                size="small"
                aria-label="Add"
                onClick={() => onAdd(id, n)}
              >
                <AddIcon fontSize="inherit" />
              </IconButton>
            )}
          </Stack>
        </Box>
      );
      const hasChildren = Array.isArray(n.children) && n.children.length > 0;
      return (
        <CustomTreeItem
          key={id}
          itemId={id}
          label={label}
          isRootNode={isRootLevel}
        >
          {hasChildren ? renderNodes(n.children, false) : null}
        </CustomTreeItem>
      );
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight={160}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 1 }}>
        {error}
      </Alert>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 1 }}>
        No categories found. Click "Add Category" to create your first category.
      </Alert>
    );
  }

  return (
    <SimpleTreeView
      expandedItems={expandedIds}
      onExpandedItemsChange={(event, ids) => setExpandedIds(ids)}
      selectedItems={selectedItems}
      onSelectedItemsChange={(event, ids) => {
        // Ignore selection changes triggered by clicking the expand icon
        const clickedExpandIcon =
          typeof event?.target?.closest === "function" &&
          event.target.closest(".MuiTreeItem-iconContainer");
        if (clickedExpandIcon) return;
        const next = Array.isArray(ids) ? ids[0] : ids;
        if (onSelect && typeof next === "string") onSelect(next);
      }}
      sx={{
        p: 1,
        borderRadius: 1,
        backgroundColor: "transparent",
        "& .MuiTreeItem-iconContainer": { mr: 0.75 },
      }}
    >
      {renderNodes(nodes, true)}
    </SimpleTreeView>
  );
}

CategoriesTree.propTypes = {
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
  defaultExpandedIds: PropTypes.arrayOf(PropTypes.string),
  onView: PropTypes.func,
  onAdd: PropTypes.func,
};

CategoriesTree.defaultProps = {
  selectedId: undefined,
  onSelect: undefined,
  defaultExpandedIds: undefined,
  onView: undefined,
  onAdd: undefined,
};