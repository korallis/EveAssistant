import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise use the default error UI
      return (
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            m: 2,
            maxWidth: '800px',
            mx: 'auto',
            backgroundColor: (theme) => theme.palette.error.dark
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.state.error?.toString() || 'An unknown error occurred'}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box mt={4} width="100%" overflow="auto">
                <Typography variant="subtitle2" component="h3" gutterBottom>
                  Stack Trace:
                </Typography>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  padding: '1rem',
                  borderRadius: '4px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
          </Box>
        </Paper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 