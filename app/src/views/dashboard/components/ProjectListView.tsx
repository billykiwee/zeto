import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { Project } from "../../../models/types";
import ProjectCard from "./ProjectCard";
import FilterBar from "./FilterBar";

interface ProjectListViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ projects }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        sx={{ fontWeight: "bold", color: "#111827", mb: 4 }}
      >
        Projets
      </Typography>
      <FilterBar />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Box>
    </Container>
  );
};

export default ProjectListView;
