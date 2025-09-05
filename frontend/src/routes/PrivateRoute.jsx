// src/components/PrivateRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("PrivateRoute: user:", user, "loading:", loading);
    const token = localStorage.getItem("token");
    console.log("PrivateRoute: token found:", !!token);

    if (!token) {
      setIsChecking(false);
      return;
    }

    if (!user && loading) {
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [user, loading]);

  if (isChecking || loading) {
    console.log("PrivateRoute: showing loading");
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    console.log("PrivateRoute: no user, redirecting to login");
    return <Navigate to="/" replace />;
  }

  console.log("PrivateRoute: rendering children");
  return children;
};

export default PrivateRoute;