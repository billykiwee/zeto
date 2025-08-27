import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";

interface FormInputProps {
  label: string | ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormInput({
  label,
  required,
  error,
  children,
}: FormInputProps) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      width="100%"
      flex={isMobile ? undefined : 1}
    >
      <Box display="grid" gap={1} position="relative">
        <Box display="flex" gap={0.6}>
          <Typography variant="body1">{label}</Typography>
          {required && (
            <Typography color="error" component="span">
              *
            </Typography>
          )}
        </Box>
        {children}
        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              mt: 0.5,
              display: "block",
              fontSize: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
