import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onDrawerToggle: () => void;
}

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Ships', path: '/ships' },
  { label: 'Fittings', path: '/fittings' },
  { label: 'Skills', path: '/skills' },
  { label: 'Market', path: '/market' },
];

export const AppHeader = ({ isLoggedIn, onLogin, onDrawerToggle }: AppHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar position="static" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
          onClick={onDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EveAssistant
        </Typography>
        
        {/* Desktop navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex' }}>
            {navItems.map((item) => (
              <Button 
                key={item.path}
                component={RouterLink}
                to={item.path}
                color="inherit"
                sx={{ mx: 1 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        
        {/* Login button */}
        {!isLoggedIn && (
          <Button color="inherit" onClick={onLogin}>
            Login with EVE Online
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 