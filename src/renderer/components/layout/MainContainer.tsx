import React from 'react';
import { Container, Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';

interface MainContainerProps {
  children: React.ReactNode;
}

export const MainContainer = ({ children }: MainContainerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { md: `calc(100% - ${240}px)` },
        ml: { md: `${240}px` }
      }}
    >
      <Toolbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainContainer; 