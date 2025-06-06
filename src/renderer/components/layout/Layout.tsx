import React, { useState } from 'react';
import { Box } from '@mui/material';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { MainContainer } from './MainContainer';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLogin: () => void;
}

export const Layout = ({ children, isLoggedIn, onLogin }: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader 
        isLoggedIn={isLoggedIn} 
        onLogin={onLogin} 
        onDrawerToggle={handleDrawerToggle} 
      />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar open={drawerOpen} onClose={handleDrawerToggle} />
        <MainContainer>
          {children}
        </MainContainer>
      </Box>
    </Box>
  );
};

export default Layout; 