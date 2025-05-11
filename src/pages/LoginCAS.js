import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { startLoginProcess } from "./../redux/userSlice";
import { basePath } from '../constants/apiEndpoint';

function LoginCAS() {
    const url = window.location.href;
    console.log("URL is:" + url);
    
    // Get the origin and path
    const origin = window.location.origin;
    const fullPath = `${origin}${basePath}login-cas`;
    
    // Create properly encoded URL for CAS
    const encodedURL = encodeURIComponent(fullPath);
    const casLoginBaseURL = "https://login.sabanciuniv.edu/cas/login?service=";
    const casLoginURL = casLoginBaseURL + encodedURL;
    
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const isLoading = useSelector((state) => state.user.isLoading);
    const dispatch = useDispatch();

    useEffect(() => {
      if (!isLoggedIn && !isLoading) {
        // If there's no ticket in the URL, redirect to CAS login
        if (url.indexOf("?ticket=") === -1) {
          console.log("Redirecting to CAS login:", casLoginURL);
          window.location.href = casLoginURL;
        } else {
          // Extract the ticket from the URL
          const ticket = url.split("?ticket=")[1];
          
          // Use the fixed serviceUrl instead of extracting from current URL
          const serviceUrl = fullPath;
          
          console.log("CAS Authentication with:", {
            serviceUrl,
            ticket
          });
          
          // Start login process
          dispatch(startLoginProcess({
            serviceUrl,
            ticket
          }));
        }
      }
    }, [dispatch, isLoggedIn, isLoading, url, casLoginURL, fullPath]);

    return (
        <div>
            <Typography variant="h4">
                Redirecting to Sabanci University Login...
            </Typography>
        </div>
    )
}

export default LoginCAS