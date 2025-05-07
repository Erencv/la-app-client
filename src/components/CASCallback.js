import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { startLoginProcess } from '../redux/userSlice';
import { validateLogin } from '../apiCalls';
import { CircularProgress, Box, Typography } from '@mui/material';
import { basePath } from '../constants/apiEndpoint';

function CASCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const ticket = searchParams.get('ticket');
    
    if (!ticket) {
      // No ticket found, redirect to login
      navigate('/', { replace: true });
      return;
    }
    
    // Start login process
    dispatch(startLoginProcess());
    
    // The callback URL (serviceUrl) should match what was sent to CAS
    // Include the basePath to match the deployed application URL
    const serviceUrl = `${window.location.origin}${basePath}cas-callback`;
    
    // Validate the ticket with the backend
    validateLogin(serviceUrl, ticket)
      .then(() => {
        // Login is handled in App.js after validateLogin
        // Just remove the ticket from URL and redirect to home
        navigate('/home', { replace: true });
      })
      .catch(error => {
        console.error('Login validation failed:', error);
        navigate('/', { replace: true });
      });
  }, [dispatch, navigate, searchParams, location]);
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" style={{ marginTop: 20 }}>
        Authenticating...
      </Typography>
    </Box>
  );
}

export default CASCallback; 