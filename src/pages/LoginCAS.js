import { Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { startLoginProcess, successLogin } from "./../redux/userSlice";

function LoginCAS() {
    const url = window.location.href;
    console.log("URL is:" + url);
    const encodedURL = encodeURIComponent(url);
    // const casLoginBaseURL = "https://login.sabanciuniv.edu/cas/login?service=";
    // const casLoginURL = casLoginBaseURL + encodedURL;
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const isLoading = useSelector((state) => state.user.isLoading);
    let error_text = "";
    const dispatch = useDispatch();

    useEffect(() => {
      if (!isLoggedIn && !isLoading) {
        // Debug: bypass CAS login by directly dispatching a successful login.
        dispatch(successLogin({
          token: "debug_token_for_testing_only",
          username: "debug@example.com",
          name: "Debug",
          surname: "User",
          id: "1",
          isInstructor: true,  // Set to false for student role
          notificationPreference: null,
          photoUrl: "",
          universityId: ""
        }));
        console.log("CAS login bypassed for debugging.");
        
        // Original CAS redirect code is commented out:
        // if (url.indexOf("?ticket=") !== -1 || url.indexOf("&ticket=") !== -1) {
        //   error_text = "error";
        // } else {
        //   dispatch(startLoginProcess());
        //   window.location.replace(casLoginURL);
        // }
      }
    }, [dispatch, isLoggedIn, isLoading])

    return (
      <>
        <Typography>{error_text}</Typography>
      </>
    )
}

export default LoginCAS