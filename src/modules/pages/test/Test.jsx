import { Box, Typography } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

const Test = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        backgroundColor: "white",
      }}
    >
      <ConstructionIcon
        sx={{
          fontSize: 80,
          color: "#667eea",
          opacity: 0.9,
        }}
      />
      <Typography
        variant="h3"
        sx={{
          color: "#333",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        Under Construction
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#666",
          opacity: 0.8,
          textAlign: "center",
        }}
      >
        This page is currently being built. Check back soon!
      </Typography>
    </Box>
  );
};

export default Test;
