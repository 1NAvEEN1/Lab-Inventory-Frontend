import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const AttributesInput = ({ value, onChange, disabled, error, helperText }) => {
  const [attributes, setAttributes] = useState([{ key: "", value: "" }]);

  // Parse initial value from object or JSON string
  useEffect(() => {
    if (value) {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (typeof parsed === "object" && parsed !== null) {
          const entries = Object.entries(parsed);
          if (entries.length > 0) {
            setAttributes(entries.map(([key, value]) => ({ key, value: String(value) })));
          } else {
            setAttributes([{ key: "", value: "" }]);
          }
        } else {
          setAttributes([{ key: "", value: "" }]);
        }
      } catch (e) {
        console.error("Error parsing attributes:", e);
        setAttributes([{ key: "", value: "" }]);
      }
    } else {
      setAttributes([{ key: "", value: "" }]);
    }
  }, [value]);

  // Convert attributes to object and call onChange
  const updateAttributes = (newAttributes) => {
    setAttributes(newAttributes);
    
    // Filter out empty rows and convert to object
    const filtered = newAttributes.filter(attr => attr.key.trim() !== "");
    const attributesObj = {};
    filtered.forEach(attr => {
      if (attr.key.trim()) {
        attributesObj[attr.key.trim()] = attr.value.trim();
      }
    });
    
    // Pass as object instead of JSON string
    if (onChange) {
      onChange(attributesObj);
    }
  };

  const handleKeyChange = (index, newKey) => {
    const newAttributes = [...attributes];
    newAttributes[index].key = newKey;
    updateAttributes(newAttributes);
  };

  const handleValueChange = (index, newValue) => {
    const newAttributes = [...attributes];
    newAttributes[index].value = newValue;
    updateAttributes(newAttributes);
  };

  const handleAddRow = () => {
    const newAttributes = [...attributes, { key: "", value: "" }];
    updateAttributes(newAttributes);
  };

  const handleDeleteRow = (index) => {
    if (attributes.length > 1) {
      const newAttributes = attributes.filter((_, i) => i !== index);
      updateAttributes(newAttributes);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        Attributes
      </Typography>
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          border: error ? "1px solid #d32f2f" : "1px solid rgba(0, 0, 0, 0.23)",
          borderRadius: 1,
        }}
      >
        <Stack spacing={2}>
          {attributes.map((attr, index) => (
            <Box key={index}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  placeholder="Key"
                  value={attr.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  size="small"
                  disabled={disabled}
                  sx={{ flex: 1 }}
                  error={error && attr.key.trim() === ""}
                />
                <TextField
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  size="small"
                  disabled={disabled}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => handleDeleteRow(index)}
                  disabled={disabled || attributes.length === 1}
                  size="small"
                  color="error"
                  sx={{ 
                    minWidth: 32, 
                    height: 32,
                    opacity: attributes.length === 1 ? 0.3 : 1 
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              {index < attributes.length - 1 && (
                <Divider sx={{ mt: 1, opacity: 0.5 }} />
              )}
            </Box>
          ))}
          
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mr: 1 }}
            >
              Add attribute
            </Typography>
            <IconButton
              onClick={handleAddRow}
              disabled={disabled}
              size="small"
              color="primary"
              sx={{ 
                minWidth: 32, 
                height: 32,
                border: "1px dashed #1976d2",
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                }
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      </Paper>
      
      {helperText && (
        <Typography 
          variant="caption" 
          color={error ? "error" : "text.secondary"}
          sx={{ mt: 0.5, display: "block" }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

AttributesInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};

AttributesInput.defaultProps = {
  value: "",
  onChange: undefined,
  disabled: false,
  error: false,
  helperText: "",
};

export default AttributesInput;
