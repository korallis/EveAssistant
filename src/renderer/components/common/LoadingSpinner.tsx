import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40, 
  color = 'primary' 
}: LoadingSpinnerProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={3}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" marginTop={2}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner; 