import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { Activity, Note } from "../../../models/types";

interface ActivitySidebarProps {
  activities: Activity[];
  notes: Note[];
}

const ActivitySidebar: React.FC<ActivitySidebarProps> = ({
  activities,
  notes,
}) => {
  const getActivityColor = (type: string) => {
    const colors = {
      document: "#3B82F6",
      task: "#10B981",
      note: "#F59E0B",
      file: "#8B5CF6",
    };
    return colors[type as keyof typeof colors] || "#6B7280";
  };

  return (
    <Box
      sx={{
        width: 320,
        bgcolor: "white",
        borderLeft: "1px solid #E5E7EB",
        p: 3,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: "#111827", mb: 2 }}
        >
          Activité
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {activities.map((activity) => (
            <Box
              key={activity.id}
              sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
            >
              <Chip
                label={activity.avatar}
                sx={{
                  bgcolor: getActivityColor(activity.type),
                  color: "white",
                  width: 32,
                  height: 32,
                  fontSize: "12px",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "#111827" }}
                    noWrap
                  >
                    {activity.user}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    {activity.time}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  {activity.action}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
            Notes
          </Typography>
          <ChevronRight sx={{ color: "#9CA3AF" }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {notes.map((note) => (
            <Paper
              key={note.id}
              sx={{ p: 2, bgcolor: "#F9FAFB", elevation: 0 }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#111827", mb: 0.5 }}
              >
                {note.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6B7280" }}>
                {note.content}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ActivitySidebar;
