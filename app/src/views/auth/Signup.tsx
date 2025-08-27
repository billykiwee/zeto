import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Card,
  Grid,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Chip,
  Container,
  IconButton,
} from "@mui/material";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  CreditCard,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserDb, Company } from "../../models/types";
import { AppService } from "../../services/app.service";

const steps = ["Informations utilisateur", "Informations entreprise"];

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [_, setUrlParams] = useSearchParams();

  const roleOptions = useMemo(() => {
    return [
      // { value: "admin", label: "Administrateur", color: "#f44336" },
      // { value: "owner", label: "Propriétaire", color: "#3f51b5" },
      // { value: "manager", label: "Manager", color: "#4CAF50" },
      { value: "client", label: "Client", color: "#ff9800" },
      { value: "advertiser", label: "Annonceur", color: "#9c27b0" },
    ];
  }, []);

  const [userData, setUserData] = useState<
    Partial<UserDb> & { password: string }
  >({
    displayName: "",
    email: "",
    role: "client",
    password: "",
    photoURL: "",
  });

  const [companyData, setCompanyData] = useState<Partial<Company>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    billingAddress: "",
    siret: "",
    vatNumber: "",
    accountHolder: "",
    RIB: "",
    BIC: "",
    interests: [],
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateUserForm = () => {
    const errors: Record<string, string> = {};

    if (!userData.displayName?.trim()) {
      errors.displayName = "Le nom est requis";
    }

    if (!userData.email?.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!userData.password || userData.password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    if (!userData.role) {
      errors.role = "Le rôle est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCompanyForm = () => {
    const errors: Record<string, string> = {};

    if (!companyData.name?.trim()) {
      errors.companyName = "Le nom de l'entreprise est requis";
    }

    if (!companyData.email?.trim()) {
      errors.companyEmail = "L'email de l'entreprise est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
      errors.companyEmail = "Format d'email invalide";
    }

    if (!companyData.phone?.trim()) {
      errors.companyPhone = "Le téléphone de l'entreprise est requis";
    }

    if (!companyData.address?.trim()) {
      errors.address = "L'adresse est requise";
    }

    if (!companyData.siret?.trim()) {
      errors.siret = "Le numéro SIRET est requis";
    }

    if (!companyData.vatNumber?.trim()) {
      errors.vatNumber = "Le numéro de TVA est requis";
    }

    if (!companyData.accountHolder?.trim()) {
      errors.accountHolder = "Le titulaire du compte est requis";
    }

    if (!companyData.RIB?.trim()) {
      errors.RIB = "Le RIB est requis";
    }

    if (!companyData.BIC?.trim()) {
      errors.BIC = "Le code BIC est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateUserForm()) {
        setActiveStep(1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      // L'utilisateur sera redirigé automatiquement après la connexion
    } catch (err) {
      setError("Erreur lors de l'inscription avec Google");
      console.error("Error with Google signup:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (activeStep === 1 && !validateCompanyForm()) {
      return;
    }

    if (activeStep === 0 && !validateUserForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const finalUserData: UserDb = {
        ...AppService.inititalUser,
        displayName: userData.displayName!.trim(),
        email: userData.email!.trim(),
        role: userData.role as UserDb["role"],
        photoURL: userData.photoURL || "",
      };
      console.log(finalUserData);

      // Save user data to database
      const userCreated = await AppService.createUser(
        finalUserData,
        userData.password
      );

      // Create company only if required
      if (requiresCompany) {
        const finalCompanyData: Company = {
          ...AppService.initialCompany,
          userId: finalUserData.id,
          name: companyData.name!.trim(),
          email: companyData.email!.trim(),
          phone: companyData.phone!.trim(),
          address: companyData.address!.trim(),
          billingAddress: companyData.billingAddress?.trim() || "",
          siret: companyData.siret!.trim(),
          vatNumber: companyData.vatNumber!.trim(),
          accountHolder: companyData.accountHolder!.trim(),
          RIB: companyData.RIB!.trim(),
          BIC: companyData.BIC!.trim(),
          interests: companyData.interests || [],
          createdAt: new Date().toISOString(),
        };

        await AppService.createCompany(finalCompanyData);
      }

      // Connecter le user
      await signIn(String(userCreated?.email), userData.password);

      // Redirect to dashboard or login
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserInputChange = (field: string, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCompanyInputChange = (
    field: string,
    value: string | string[]
  ) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    const selectedRole = roleOptions.find(
      (role) => role.value === userData.role
    );
    setUrlParams(`role=${selectedRole?.value}`);
  }, [userData]);

  // Check if user role requires company information
  const requiresCompany =
    userData.role &&
    ["owner", "manager", "client", "advertiser"].includes(userData.role);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              flex: 1.4,
              width: "100%",
              maxWidth: { xs: "100%", lg: "560px" },
            }}
          >
            <Box
              sx={{
                flex: 1,
                textAlign: "center",
              }}
            >
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    {activeStep === 0 ? "Créer mon compte" : "Mon entreprise"}
                    {roleOptions
                      .filter((e) => e.value === userData.role)
                      .map((role, i) => {
                        return (
                          <Box
                            key={i}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: role.color,
                              }}
                            />
                            {role.label}
                          </Box>
                        );
                      })}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {activeStep === 0
                    ? "Rejoignez notre plateforme en quelques étapes"
                    : "Complétez les informations de votre entreprise"}
                </Typography>
              </Box>
              {/* Stepper */}
              {requiresCompany && (
                <Box sx={{ mb: 4 }}>
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    orientation="horizontal"
                  >
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel
                          sx={{
                            "& .MuiStepLabel-label": {
                              color:
                                index <= activeStep
                                  ? "white"
                                  : "rgba(255,255,255,0.5)",
                              fontSize: "0.875rem",
                            },
                            "& .MuiStepIcon-root": {
                              color:
                                index <= activeStep
                                  ? "#3f51b5"
                                  : "rgba(255,255,255,0.3)",
                            },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              )}
            </Box>

            <Card
              sx={{
                p: 4,
                bgcolor: "#1E1F23",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
              }}
            >
              {/* Google Sign Up - Only on first step */}
              {activeStep === 0 && (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleGoogleSignUp}
                    disabled={googleLoading || loading}
                    startIcon={
                      googleLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <img
                          src="https://www.google.com/favicon.ico"
                          alt="Google"
                          style={{ width: 20, height: 20 }}
                        />
                      )
                    }
                    sx={{
                      py: 1.5,
                      color: "white",
                      borderColor: "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    {googleLoading ? "Connexion..." : "Continuer avec Google"}
                  </Button>

                  <Divider sx={{ my: 3, color: "rgba(255,255,255,0.3)" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Ou créer un compte avec email
                    </Typography>
                  </Divider>
                </>
              )}

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {/* Step 1: User Information */}
              {activeStep === 0 && (
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* User Form Fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "white" }}
                      >
                        Prénom
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Entrez votre prénom"
                        value={userData.displayName}
                        onChange={(e) =>
                          handleUserInputChange("displayName", e.target.value)
                        }
                        error={!!validationErrors.displayName}
                        helperText={validationErrors.displayName}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3f51b5",
                            },
                          },
                          "& .MuiInputBase-input": { color: "white" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "white" }}
                      >
                        Email
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="email@exemple.com"
                        value={userData.email}
                        onChange={(e) =>
                          handleUserInputChange("email", e.target.value)
                        }
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3f51b5",
                            },
                          },
                          "& .MuiInputBase-input": { color: "white" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "white" }}
                      >
                        Rôle
                      </Typography>
                      <FormControl
                        fullWidth
                        error={!!validationErrors.role}
                        disabled={loading}
                      >
                        <Select
                          value={userData.role}
                          onChange={(e) =>
                            handleUserInputChange("role", e.target.value)
                          }
                          startAdornment={
                            <InputAdornment position="start">
                              <Shield size={16} />
                            </InputAdornment>
                          }
                          sx={{
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3f51b5",
                            },
                            color: "white",
                          }}
                        >
                          {roleOptions.map((role) => (
                            <MenuItem key={role.value} value={role.value}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    bgcolor: role.color,
                                  }}
                                />
                                {role.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "white" }}
                      >
                        Mot de passe
                      </Typography>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 caractères"
                        value={userData.password}
                        onChange={(e) =>
                          handleUserInputChange("password", e.target.value)
                        }
                        error={!!validationErrors.password}
                        helperText={
                          validationErrors.password || "Minimum 6 caractères"
                        }
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                                sx={{ color: "rgba(255,255,255,0.7)" }}
                              >
                                {showPassword ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,0.2)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(255,255,255,0.3)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3f51b5",
                            },
                          },
                          "& .MuiInputBase-input": { color: "white" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Step 2: Company Information */}
              {activeStep === 1 && (
                <Box sx={{ display: "grid", gap: 3 }}>
                  {/* Company Form Fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        Informations générales
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Nom de l'entreprise
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Nom de l'entreprise"
                        value={companyData.name}
                        onChange={(e) =>
                          handleCompanyInputChange("name", e.target.value)
                        }
                        error={!!validationErrors.companyName}
                        helperText={validationErrors.companyName}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Building2 size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Email entreprise
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="contact@entreprise.com"
                        value={companyData.email}
                        onChange={(e) =>
                          handleCompanyInputChange("email", e.target.value)
                        }
                        error={!!validationErrors.companyEmail}
                        helperText={validationErrors.companyEmail}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Téléphone entreprise
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="01 23 45 67 89"
                        value={companyData.phone}
                        onChange={(e) =>
                          handleCompanyInputChange("phone", e.target.value)
                        }
                        error={!!validationErrors.companyPhone}
                        helperText={validationErrors.companyPhone}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        SIRET
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="12345678901234"
                        value={companyData.siret}
                        onChange={(e) =>
                          handleCompanyInputChange("siret", e.target.value)
                        }
                        error={!!validationErrors.siret}
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Adresse
                      </Typography>
                      <TextField
                        fullWidth
                        rows={2}
                        placeholder="Adresse complète de l'entreprise"
                        value={companyData.address}
                        onChange={(e) =>
                          handleCompanyInputChange("address", e.target.value)
                        }
                        error={!!validationErrors.address}
                        helperText={validationErrors.address}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapPin size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Adresse de facturation (optionnel)
                      </Typography>
                      <TextField
                        fullWidth
                        rows={2}
                        placeholder="Si différente de l'adresse principale"
                        value={companyData.billingAddress}
                        onChange={(e) =>
                          handleCompanyInputChange(
                            "billingAddress",
                            e.target.value
                          )
                        }
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Numéro de TVA
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="FR12345678901"
                        value={companyData.vatNumber}
                        onChange={(e) =>
                          handleCompanyInputChange("vatNumber", e.target.value)
                        }
                        error={!!validationErrors.vatNumber}
                        helperText={validationErrors.vatNumber}
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        Informations bancaires
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        RIB
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Relevé d'identité bancaire"
                        value={companyData.RIB}
                        onChange={(e) =>
                          handleCompanyInputChange("RIB", e.target.value)
                        }
                        error={!!validationErrors.RIB}
                        helperText={validationErrors.RIB}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCard size={16} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Code BIC
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="BNPAFRPPXXX"
                        value={companyData.BIC}
                        onChange={(e) =>
                          handleCompanyInputChange("BIC", e.target.value)
                        }
                        error={!!validationErrors.BIC}
                        helperText={validationErrors.BIC}
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Titulaire du compte
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Nom du titulaire du compte bancaire"
                        value={companyData.accountHolder}
                        onChange={(e) =>
                          handleCompanyInputChange(
                            "accountHolder",
                            e.target.value
                          )
                        }
                        error={!!validationErrors.accountHolder}
                        helperText={validationErrors.accountHolder}
                        disabled={loading}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(255,255,255,0.05)",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                      <Box mb={1} mt={2}>
                        <Typography variant="subtitle2">
                          Centres d'intérêt
                        </Typography>

                        <Typography variant="caption" color="grey">
                          Ajouter des centres d'intérêt: technologie, sport,
                          ville (ex: Paris 75001)
                        </Typography>
                      </Box>

                      <Autocomplete
                        multiple
                        value={companyData.interests || []}
                        onChange={(_, newValue) => {
                          handleCompanyInputChange("interests", newValue);
                        }}
                        options={[]}
                        freeSolo
                        renderTags={(value: readonly string[], getTagProps) =>
                          value.map((option: string, index: number) => {
                            const { key, ...chipProps } = getTagProps({
                              index,
                            });
                            return (
                              <Chip
                                key={key}
                                {...chipProps}
                                label={option}
                                size="small"
                              />
                            );
                          })
                        }
                        renderInput={(params) => (
                          <TextField
                            multiline
                            minRows={2}
                            {...params}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(255,255,255,0.05)",
                                alignItems: "start",
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "end",
                  justifyItems: "end",
                  gap: 2,
                  mt: 4,
                }}
              >
                {activeStep === 0 ? (
                  <Box>
                    <Button
                      onClick={requiresCompany ? handleNext : handleSubmit}
                      variant="contained"
                      disabled={loading}
                      endIcon={
                        requiresCompany ? (
                          <ArrowRight size={16} />
                        ) : loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )
                      }
                      sx={{
                        bgcolor: "#3f51b5",
                        "&:hover": { bgcolor: "#303f9f" },
                        px: 4,
                      }}
                    >
                      {loading
                        ? "Création en cours..."
                        : requiresCompany
                        ? "Suivant"
                        : "Créer mon compte"}
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      disabled={loading}
                      startIcon={<ArrowLeft size={16} />}
                      sx={{
                        borderColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": { borderColor: "rgba(255,255,255,0.3)" },
                      }}
                    >
                      Précédent
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )
                      }
                      sx={{
                        bgcolor: "#3f51b5",
                        "&:hover": { bgcolor: "#303f9f" },
                        px: 4,
                      }}
                    >
                      {loading ? "Création en cours..." : "Créer mon compte"}
                    </Button>
                  </>
                )}
              </Box>

              {/* Login Link */}
              {activeStep === 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    mt: 3,
                    textAlign: "center",
                  }}
                >
                  Vous avez déjà un compte ?{" "}
                  <Box
                    component="span"
                    onClick={() => navigate("/login")}
                    sx={{
                      color: "#3f51b5",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Se connecter
                  </Box>
                </Typography>
              )}
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
