import { createTheme } from '@mui/material/styles';

// EVE Online inspired dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7', // EVE blue
      light: '#8bf6ff',
      dark: '#0093c4',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff9800', // Orange for warnings and important actions
      light: '#ffc947',
      dark: '#c66900',
      contrastText: '#000000',
    },
    background: {
      default: '#141721', // Dark blue background
      paper: '#1c2026', // Slightly lighter for cards and paper components
    },
    text: {
      primary: '#f0f0f0',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#f44336', // Red for errors
    },
    warning: {
      main: '#ff9800', // Orange for warnings
    },
    info: {
      main: '#4fc3f7', // Blue for info
    },
    success: {
      main: '#4caf50', // Green for success
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1117', // Darker blue for AppBar
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1c2026', // Slightly lighter for drawer
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Don't uppercase button text
        },
      },
    },
  },
}); 