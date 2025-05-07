// API endpoint configuration
const url = window.location.href;

// Default API endpoint (production)
let apiEndpoint = "http://pro2-dev.sabanciuniv.edu:8000/api/v1";

// Override for local development
if (url.indexOf("pro2") === -1) {
  apiEndpoint = "http://localhost:8000/api/v1";
}

// Base path for the application
export const basePath = "/ens4912/";

export { apiEndpoint }; 