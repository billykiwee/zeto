import React from "react";
import { Card, CardContent, Box, Typography, List } from "@mui/material";
import {
  BarChart,
  Campaign,
  Description,
  Folder,
  InsertDriveFile,
} from "@mui/icons-material";
import { Project } from "../../../models/types";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const getIconBgColor = (iconColor: string) => {
    const colorMap: { [key: string]: string } = {
      "bg-blue-500": "#3B82F6",
      "bg-orange-500": "#F97316",
      "bg-teal-500": "#14B8A6",
      "bg-green-500": "#10B981",
      "bg-purple-500": "#8B5CF6",
    };
    return colorMap[iconColor] || "#6B7280";
  };

  const icons: Record<string, any> = {
    folder: Folder,
    chart: BarChart,
    document: Description,
    megaphone: Campaign,
    list: List,
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        "&:hover": {
          boxShadow: 3,
          borderColor: "#E5E7EB",
        },
        transition: "all 0.2s",
        border: "1px solid #F3F4F6",
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              //  bgcolor: getIconBgColor(project.iconColor),
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/*  {icons[project.type]} */}
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#111827", mb: 0.5 }}
            >
              {project.name}
            </Typography>
            {project.fileCount && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <InsertDriveFile sx={{ fontSize: 16, color: "#6B7280" }} />
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {project.fileCount} fichier{project.fileCount > 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: "#6B7280" }}>
          {project.date}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
