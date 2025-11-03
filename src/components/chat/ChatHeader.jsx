
import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ChatHeader = ({ isMobile, hasUserStartedMessaging, onStartNewChat }) => {
  if (isMobile) {
    return (
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "#333",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2 }}>
          <IconButton edge="start" color="inherit" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>

          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: "#ff6b35" }}>
            <Typography variant="caption" color="white" fontWeight="bold">
              M
            </Typography>
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontSize: "1rem", fontWeight: 500, color: "#333" }}
            >
              Ember - Triage assistant
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem" }}
            >
              Online
            </Typography>
          </Box>

          {hasUserStartedMessaging && (
            <Button
              onClick={onStartNewChat}
              size="small"
              sx={{
                bgcolor: "#125A67",
                color: "white",
                fontSize: "0.75rem",
                px: 2,
                py: 0.5,
                mr: 1,
                textTransform: "none",
                borderRadius: 20,
                "&:hover": { bgcolor: "#0d434c" },
              }}
            >
              Start New Chat
            </Button>
          )}

          <IconButton color="inherit">
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #e0e0e0",
        p: 2,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}
      >
        <Avatar sx={{ width: 40, height: 40, bgcolor: "#ff6b35" }}>
          <Typography variant="body2" color="white" fontWeight="bold">
            M
          </Typography>
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#333" }}
          >
            Ember - Triage assistant
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Please answer the questions below to help us assist you better
          </Typography>
        </Box>

        {hasUserStartedMessaging && (
          <Button
            onClick={onStartNewChat}
            size="small"
            sx={{
              bgcolor: "#125A67",
              color: "white",
              fontSize: "0.875rem",
              px: 3,
              py: 1,
              textTransform: "none",
              borderRadius: 20,
              "&:hover": { bgcolor: "#0d434c" },
            }}
          >
            Start New Chat
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ChatHeader;
