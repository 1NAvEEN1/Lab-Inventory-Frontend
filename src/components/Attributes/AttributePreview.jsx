import React from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";

const AttributePreview = ({ attribute }) => {
  const { label, type, options } = attribute;
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        bgcolor: "background.default",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label || "Untitled"}
        </Typography>
        <Chip size="small" label={type} />
      </Stack>
      {Array.isArray(options) && options.length > 0 && (
        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
          {options.map((opt) => (
            <Chip key={opt} label={opt} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AttributePreview;


