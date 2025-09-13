import axios from "axios";
import store from "../app/store";

// Simple in-memory token cache backed by Redux state (auth slice to be added)
let isRefreshing = false;
let pendingQueue = [];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

api.interceptors.request.use((config) => {
  const state = store.getState();
  const accessToken = state?.auth?.accessToken;
  if (accessToken) {
    // Backend expects raw JWT without "Bearer " prefix per collection note
    config.headers["Authorization"] = accessToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // If unauthorized, try refresh token once
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const state = store.getState();
      const refreshToken = state?.auth?.refreshToken;
      if (!refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers["Authorization"] = newAccessToken;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/Users/refresh-token`,
          { refreshToken }
        );
        const newAccessToken = data?.accessToken || data?.token || data;
        if (!newAccessToken) throw new Error("No access token in refresh response");

        // Update Redux store auth slice if available
        try {
          const { setTokens } = await import("../reducers/authSlice");
          store.dispatch(setTokens({ accessToken: newAccessToken, refreshToken }));
        } catch (_) {
          // auth slice might not exist yet during initial wiring; ignore
        }

        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = newAccessToken;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Optional: clear auth state
        try {
          const { clearAuth } = await import("../reducers/authSlice");
          store.dispatch(clearAuth());
        } catch (_) {}
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


