import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 240;

const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Ships', icon: <DirectionsBoatIcon />, path: '/ships' },
  { text: 'Fittings', icon: <SettingsIcon />, path: '/fittings' },
  { text: 'Skills', icon: <SchoolIcon />, path: '/skills' },
  { text: 'Market', icon: <ShoppingCartIcon />, path: '/market' },
];

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.default,
        },
        display: { xs: 'none', md: 'block' }
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 