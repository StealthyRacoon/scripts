import axios from "axios";

// ✅ Create a single shared instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// ✅ Prevent duplicate interceptor registration (important in dev)
let isInitialized = false;

// ✅ Setup function (inject notify from provider)
export function setupInterceptors(notify) {
  if (isInitialized) return;
  isInitialized = true;

  // 🔹 Request interceptor (optional: auth, logging later)
  api.interceptors.request.use(
    (config) => {
      // Example: attach token later if needed
      // const token = localStorage.getItem("token");
      // if (token) config.headers.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 🔹 Response interceptor
  api.interceptors.response.use(
    (response) => response,

    (error) => {
      const { response, config } = error;

      // ✅ Silent mode (skip notifications)
      if (config?.silent) {
        return Promise.reject(error);
      }

      let message = "Something went wrong";

      if (!response) {
        message = "Network error — check your connection";
      } else {
        const status = response.status;

        switch (status) {
          case 400:
            message = "Bad request";
            break;
          case 401:
            message = "Unauthorized — please log in";
            break;
          case 403:
            message = "Access denied";
            break;
          case 404:
            message = "Resource not found";
            break;
          case 500:
            message = "Server error — try again later";
            break;
          default:
            message = response.data?.message || `Error ${status}`;
        }
      }

      notify.error(message);

      return Promise.reject(error);
    }
  );
}

// ✅ Export the instance
export default api;