
import React from "react";
import { Box, Typography } from "@mui/material";

const Completion = ({ isMobile }) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        borderTop: "1px solid #e0e0e0",
        p: 3,
        textAlign: "center",
        flexShrink: 0,
        ...(isMobile
          ? {}
          : {
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }),
      }}
    >
      <Typography variant="body1" sx={{ color: "#28a745", fontWeight: 600 }}>
        Thank you for completing the questionnaire!
      </Typography>
      <Typography variant="body2" sx={{ color: "#6c757d", mt: 1 }}>
        Our team will review your responses and get back to you soon.
      </Typography>
    </Box>
  );
};

export default Completion;