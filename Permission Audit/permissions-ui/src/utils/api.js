import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

let isInitialized = false;

export function setupInterceptors(notify) {
  if (isInitialized) return;
  isInitialized = true;

  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response, config } = error;

      if (config?.silent) {
        return Promise.reject(error);
      }

      const message =
        response?.data?.message ||
        error.message ||
        "Request failed";

      notify.error(message);

      return Promise.reject(error);
    }
  );
}

export default api;