import { useDispatch } from 'react-redux';
import react from 'react';
import { toast } from 'react-toastify';
import { logout } from "../apiCalls";

export default function handleError(error) {
  // Handle authentication errors (401 Unauthorized)
  if (error.response && error.response.status === 401) {
    // Clear stored tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    toast.error("Your session has expired. Please log in again.", {
      containerId: "1618",
      closeOnClick: true,
    });
    
    // Redirect to login
    const baseUrl = window.location.origin;
    window.location.replace(baseUrl);
    return;
  }
  
  // Handle other response errors
  if (error.response) {
    toast.error(`Error: ${error.response.status} - ${error.response.data.message ?? error.response.data.error ?? error.response.data.detail}`, {
      containerId: "1618",
      closeOnClick: true,
    });
  } else if (error.message) {
    toast.error(`Network Error: ${error.message}`,{
      containerId: "1618",
      closeOnClick: true,
    });
  } else {
    toast.error('An error occurred.',{
      containerId: "1618",
      closeOnClick: true,
    });
  }

  throw error
};

const CustomToastContent = ({ info, onMouseEnter, onMouseLeave }) => {
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {info}
    </div>
  );
};


export function handleInfo(info) {

  const handleMouseEnter = () => {
    toast.pause()
  };

  const handleMouseLeave = () => {

    toast.play()
  };

  toast.info(<CustomToastContent
    info={info}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}

  />, {
    containerId: "1618",
    closeOnClick: true,
  });
}
export function handleServerDownError() {
  toast.error("Server is not responding right now :(",{
    containerId: "1618",
    closeOnClick: true,
  })
}
