// src/api/api.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    console.error("Response error:", error);
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const res = await api.post("/refresh");
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, show error message and then logout user
        console.error("Token refresh failed:", refreshError);

        // Create a more user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '20px';
        errorMessage.style.right = '20px';
        errorMessage.style.padding = '15px';
        errorMessage.style.backgroundColor = '#f44336';
        errorMessage.style.color = 'white';
        errorMessage.style.borderRadius = '4px';
        errorMessage.style.zIndex = '9999';
        errorMessage.textContent = 'Your session has expired. Please log in again.';
        document.body.appendChild(errorMessage);

        // Remove the message after 3 seconds and then redirect
        setTimeout(() => {
          document.body.removeChild(errorMessage);
          localStorage.removeItem("token");
          window.location.href = "/";
        }, 3000);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token management functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (err) {
    return false;
  }
};

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    return null;
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

// Authentication APIs
export const login = async (username, password) => {
  try {
    console.log("Attempting login with:", { username, password });

    // Create a URL-encoded form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post("/login", formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("Login response:", response);

    if (!response.data || !response.data.token) {
      throw new Error("No token received from server");
    }

    const { token } = response.data;
    console.log("Received token:", token);

    // Store token in localStorage
    localStorage.setItem("token", token);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
    removeAuthToken();
  } catch (error) {
    // Even if logout fails on server, clear local token
    removeAuthToken();
    throw error;
  }
};

// User Management APIs
export const fetchUsers = () => api.get("/users");
export const createUser = (data) => api.post("/users", data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const fetchUser = (id) => api.get(`/users/${id}`);

// Password Management
export const changePassword = (userId, newPassword) =>
  api.put(`/users/${userId}/password`, { new_password: newPassword });

// Property APIs
export const fetchProperties = () => api.get("/properties");
export const createProperty = (data) => api.post("/properties", data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);

// File upload: image
export const uploadPropertyImage = (propertyId, formData) =>
  api.post(`/properties/${propertyId}/upload_image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// File upload: verification docs
export const uploadPropertyVerificationDocs = (propertyId, formData) =>
  api.post(`/properties/${propertyId}/upload_docs`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Verify property
export const verifyProperty = (propertyId, data) =>
  api.put(`/properties/${propertyId}`, data);

// Upload user avatar
export const uploadUserAvatar = (userId, formData) =>
  api.post(`/users/${userId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Notification APIs (for future use)
export const fetchNotifications = () => api.get("/notifications");
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put("/notifications/read-all");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);