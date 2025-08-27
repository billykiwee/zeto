import { Link, Box, IconButton, Breadcrumbs, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BreadCrumbs({
  links,
}: {
  links: { path?: string; label: string }[];
}) {
  const navigate = useNavigate();
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={() => navigate(links.at(0)?.path || "")}
          sx={{
            color: "white",
            bgcolor: "rgba(255,255,255,0.05)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <ChevronLeft size={15} />
        </IconButton>
        <Breadcrumbs
          separator="›"
          sx={{
            color: "rgba(255,255,255,0.5)",
            "& .MuiLink-root": {
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              "&:hover": { color: "white" },
            },
          }}
        >
          {links.map((link, i, arr) => {
            if (i + 1 === arr.length) {
              return (
                <Typography key={i} color="white">
                  {link.label}
                </Typography>
              );
            } else
              return (
                <Link
                  key={i}
                  component="button"
                  onClick={() => navigate(link.path || "")}
                >
                  {link.label}
                </Link>
              );
          })}
        </Breadcrumbs>
      </Box>
    </Box>
  );
}
