import axios from "axios";

const api = axios.create({
  // In dev the server proxies /api to the backend, so a relative base keeps every
  // request same-origin and CORS-free. In production there is no such proxy, so
  // VITE_API_URL points at the deployed backend's URL instead.
  baseURL: import.meta.env.VITE_API_URL || "/api",
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
