import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Divider,
  Stack,
  InputAdornment,
} from "@mui/material";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Définir les types pour les fonctions du contexte d'authentification
interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { signIn, signInWithGoogle } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error("Erreur de connexion:", error.message, error.code);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error(
        "Erreur de connexion avec Google:",
        error.message,
        error.code
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A", // Fond sombre comme dans l'image
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Section formulaire (à droite) */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { xs: "100%", md: "400px" },
              p: 4,
              backgroundColor: "transparent",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: "white", fontWeight: "bold" }}
            >
              Se connecter
            </Typography>

            {/* Options de connexion avec Google */}
            <Typography variant="body2" sx={{ color: "gray", mb: 2 }}>
              Se connecter avec un compte Open
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    style={{ width: 20 }}
                  />
                }
                onClick={handleGoogleSignIn}
                sx={{
                  flex: 1,
                  color: "white",
                  borderColor: "gray",
                  backgroundColor: "#2A2A2A",
                  "&:hover": {
                    backgroundColor: "#3A3A3A",
                    borderColor: "gray",
                  },
                }}
              >
                Google
              </Button>
            </Stack>

            {/* Séparateur */}
            <Divider sx={{ my: 2, color: "gray" }}>
              Ou continuer avec une adresse email
            </Divider>

            {/* Formulaire email et mot de passe */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color="gray" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  backgroundColor: "#2A2A2A",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "gray" },
                    "&:hover fieldset": { borderColor: "gray" },
                    "&.Mui-focused fieldset": { borderColor: "gray" },
                    color: "white",
                  },
                  "& .MuiInputBase-input": { color: "white" },
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Entrez votre mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color="gray" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ cursor: "pointer" }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="gray" />
                        ) : (
                          <Eye size={20} color="gray" />
                        )}
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  backgroundColor: "#2A2A2A",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "gray" },
                    "&:hover fieldset": { borderColor: "gray" },
                    "&.Mui-focused fieldset": { borderColor: "gray" },
                    color: "white",
                  },
                  "& .MuiInputBase-input": { color: "white" },
                }}
              />

              {/* Bouton de connexion */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#1E88E5",
                  color: "white",
                  py: 1.5,
                  borderRadius: 10,
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#1565C0" },
                }}
              >
                Se connecter
              </Button>
            </Box>

            {/* Lien pour s'inscrire */}
            <Typography
              variant="body2"
              sx={{ color: "gray", mt: 2, textAlign: "center" }}
            >
              Vous n'avez pas de compte ?{" "}
              <Box
                component="span"
                sx={{ color: "white", cursor: "pointer" }}
                onClick={() => window.location.assign("/signup")}
              >
                S'inscrire
              </Box>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
