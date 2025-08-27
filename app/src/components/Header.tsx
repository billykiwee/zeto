import React from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Box,
  InputAdornment,
} from "@mui/material";
import { Search, Add } from "@mui/icons-material";

const Header = () => {
  const onNewProject = () => {};
  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#4F46E5",
                "&:hover": { color: "#3730A3" },
                transition: "color 0.2s",
              }}
            >
              ZÉTO
            </Typography>
          </Link>
          <TextField
            placeholder="Rechercher"
            variant="outlined"
            size="small"
            sx={{
              width: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#F9FAFB",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onNewProject}
          sx={{
            bgcolor: "#4F46E5",
            "&:hover": { bgcolor: "#3730A3" },
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          Nouveau Projet
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
