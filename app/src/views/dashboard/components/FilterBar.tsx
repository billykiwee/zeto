import React from "react";
import { Box, Button } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

const FilterBar: React.FC = () => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
      <Button
        endIcon={<KeyboardArrowDown />}
        sx={{
          color: "#374151",
          textTransform: "none",
          "&:hover": { color: "#111827" },
        }}
      >
        Date
      </Button>
      <Button
        endIcon={<KeyboardArrowDown />}
        sx={{
          color: "#374151",
          textTransform: "none",
          "&:hover": { color: "#111827" },
        }}
      >
        Type
      </Button>
      <Button
        sx={{
          color: "#374151",
          textTransform: "none",
          "&:hover": { color: "#111827" },
        }}
      >
        Utilisateur
      </Button>
    </Box>
  );
};

export default FilterBar;
