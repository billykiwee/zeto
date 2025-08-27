import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  /*   palette: {
    mode: "light",
    primary: {
      main: colors.blue[500],
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#FFFFFF",
    },
  }, */
  /*   components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 500,
          //background: colors.blue[500],
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255,255,255,0.7)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255,255,255,0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background: "#1b1d1f",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#1b1d1f",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 3,
        },
      },
    },
  }, */
  typography: {
    h2: {
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h3: {
      fontWeight: 700,
      fontSize: "2rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
  },
});

export default theme;
