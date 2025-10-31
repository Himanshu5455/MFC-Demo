import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const ProgressIndicator = ({ progress }) => {
  return (
    <Box sx={{ mt: 2, mb: 1, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Progress
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
          {progress}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#E5E7EB',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: '#125A67'
          }
        }}
      />
    </Box>
  );
};

export default ProgressIndicator;
