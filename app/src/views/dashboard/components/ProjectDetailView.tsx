import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  Chip,
  Avatar,
} from "@mui/material";
import { ArrowForward, Upload } from "@mui/icons-material";
import ActivitySidebar from "./ActivitySidebar";
import { ProjectorIcon } from "lucide-react";
import { AppService } from "../../../services/app.service";
import { useParams } from "react-router-dom";
import { Project } from "../../../models/types";

const ProjectDetailView = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>();

  useEffect(() => {
    (async () => {
      if (id) {
        setProject(await AppService.getProjectById(id));
      }
    })();
  }, [id]);

  const keyPoints = AppService.keyPoints;
  const activities = AppService.activities;
  const notes = AppService.notes;

  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    "Documents",
    "Chat IA contextuel",
    "Tâches & suivi",
    "Paramètres du projet",
  ];

  const analysisOptions = [
    "Résumé",
    "Synthèse points clés",
    "Vérifier cohérence",
    "Proposer",
  ];

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

  if (project)
    return (
      <Box sx={{ display: "flex", height: "calc(100vh - 80px)" }}>
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: getIconBgColor(project.iconColor),
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ProjectorIcon type={project.type} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "bold", color: "#111827", mb: 0.5 }}
                >
                  {project.name}
                </Typography>
                <Button
                  startIcon={<ArrowForward />}
                  sx={{
                    color: "#4F46E5",
                    textTransform: "none",
                    p: 0,
                    "&:hover": { color: "#3730A3" },
                  }}
                >
                  Modifier les infos
                </Button>
              </Box>
            </Box>

            {project.progress && (
              <Box sx={{ mb: 4 }}>
                <LinearProgress
                  variant="determinate"
                  value={project.progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#E5E7EB",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#10B981",
                    },
                  }}
                />
              </Box>
            )}

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: "1px solid #E5E7EB", mb: 4 }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    "&.Mui-selected": { color: "#4F46E5" },
                  }}
                />
              ))}
            </Tabs>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "#111827", mb: 3 }}
                >
                  Quels documents doivent être analysés?
                </Typography>
                <Button
                  startIcon={<Upload />}
                  variant="outlined"
                  sx={{
                    color: "#6B7280",
                    borderColor: "#D1D5DB",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  Analyser un document
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {analysisOptions.map((option, index) => (
                  <Chip
                    key={index}
                    label={option}
                    sx={{
                      bgcolor: index === 1 ? "#DBEAFE" : "#F3F4F6",
                      color: index === 1 ? "#1E40AF" : "#374151",
                      "&:hover": {
                        bgcolor: index === 1 ? "#BFDBFE" : "#E5E7EB",
                      },
                    }}
                  />
                ))}
              </Box>

              <Paper sx={{ p: 4, border: "1px solid #E5E7EB" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#111827", mb: 2 }}
                >
                  Synthèse points clés
                </Typography>
                <Typography sx={{ color: "#6B7280", mb: 3 }}>
                  Bien sûr ! Voici un résumé des points clés du rapport :
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {keyPoints.map((point, index) => (
                    <Box
                      component="li"
                      key={index}
                      sx={{ mb: 1, color: "#374151" }}
                    >
                      {point}
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3, bgcolor: "#F9FAFB" }}>
                <Typography sx={{ color: "#6B7280", mb: 2 }}>
                  Identifier les points clés du rapport.
                </Typography>
                <Paper
                  sx={{ p: 2, bgcolor: "white", border: "1px solid #E5E7EB" }}
                >
                  <Typography variant="body2" sx={{ color: "#111827", mb: 1 }}>
                    Bien sûr ! Voici un résumé des points clés du rapport :
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    11:22
                  </Typography>
                </Paper>
              </Paper>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 3,
                  bgcolor: "#F9FAFB",
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "#4F46E5",
                    fontSize: "14px",
                  }}
                >
                  👤
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "#111827", mb: 0.5 }}
                  >
                    Identifier les points clés du rapport.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280", mb: 1 }}>
                    Bien sûr !
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    11:21
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        <ActivitySidebar activities={activities} notes={notes} />
      </Box>
    );
};

export default ProjectDetailView;
