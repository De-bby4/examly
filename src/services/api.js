import axios from "axios";

const api = axios.create({
  // Relative on purpose: the dev server proxies /api to the backend, so requests
  // are same-origin and never hit a CORS preflight.
  baseURL: "/api",
});

// Login and register are unauthenticated calls. Sending a stale/expired token on
// them makes the backend reject the request with 403, which locks the user out of
// signing in and therefore out of clearing the bad token.
const isAuthCall = (url = "") =>
  url.startsWith("/auth/login") || url.startsWith("/auth/register");

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("examly_token");
  if (token && !isAuthCall(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (isAuthCall(error.config?.url) && (status === 401 || status === 403)) {
      localStorage.removeItem("examly_token");
      localStorage.removeItem("examly_user");
    }
    return Promise.reject(error);
  }
);

export default api;
