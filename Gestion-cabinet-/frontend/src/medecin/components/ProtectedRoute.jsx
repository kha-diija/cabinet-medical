// frontend/src/components/medecin/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = React.useState(true);
  const [isValid, setIsValid] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authService.isAuthenticated();
      setIsValid(authenticated);
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const user = authService.getCurrentUser();
    if (!user || user.role !== requiredRole) {
      // Rediriger vers la page appropriée selon le rôle
      switch (user?.role) {
        case 'MEDECIN':
          return <Navigate to="/medecin/dashboard" replace />;
        case 'SECRETAIRE':
          return <Navigate to="/secretaire/patients" replace />;
        case 'ADMINISTRATEUR':
          return <Navigate to="/admin/cabinets" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;