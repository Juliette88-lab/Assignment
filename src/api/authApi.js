import { api } from "./apiClient";

// Login
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

// Register
export const registerUser = async (name, email, password) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
};

// Request a password reset
export const requestPasswordReset = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

// Reset password using the demo token
export const resetPassword = async (
  email,
  token,
  newPassword,
  confirmPassword,
) => {
  const response = await api.post("/auth/reset-password", {
    email,
    token,
    newPassword,
    confirmPassword,
  });

  return response.data;
};

// Get the logged-in user's profile
export const getUserProfile = async (token) => {
  const response = await api.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user;
};

// Update the logged-in user's profile
export const updateUserProfile = async (profileData, token) => {
  const response = await api.put("/auth/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
