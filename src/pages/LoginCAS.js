import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { startLoginProcess } from "./../redux/userSlice";

function LoginCAS() {
    const url = window.location.href;
    console.log("URL is:" + url);
    const encodedURL = encodeURIComponent(url);
    const casLoginBaseURL = "https://login.sabanciuniv.edu/cas/login?service=";
    const casLoginURL = casLoginBaseURL + encodedURL;
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const isLoading = useSelector((state) => state.user.isLoading);
    const dispatch = useDispatch();

    useEffect(() => {
      if (!isLoggedIn && !isLoading) {
        // If there's no ticket in the URL, redirect to CAS login
        if (url.indexOf("?ticket=") === -1 && url.indexOf("&ticket=") === -1) {
          dispatch(startLoginProcess());
          window.location.replace(casLoginURL);
        }
        // If there's a ticket, App.js will handle the validation
      }
    }, [dispatch, isLoggedIn, isLoading, url, casLoginURL])

    return (
      <Typography variant="body2">Redirecting to authentication service...</Typography>
    )
}

export default LoginCAS