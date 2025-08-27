import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AppRoutes from "./routes";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingProvider from "./contexts/LoadingContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import Header from "./components/Header";

dayjs.extend(relativeTime);
dayjs.locale("fr");

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
          <LoadingProvider>
            <AuthProvider>
              <BrowserRouter>
                <Header />
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </LoadingProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
