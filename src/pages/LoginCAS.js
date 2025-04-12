import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LoadingPage from './LoadingPage/LoadingPage';

function LoginCAS() {
    const isLoading = useSelector((state) => state.user.isLoading);

    useEffect(() => {
        // Redirect to the backend SAML login endpoint
        window.location.replace('/saml2/login');
    }, []);

    // Optionally, show a loading indicator while redirecting
    if (isLoading) {
        return <LoadingPage />;
    }

    // Or just return a minimal component while the redirect happens
    return <div>Redirecting to login...</div>;
}

export default LoginCAS;