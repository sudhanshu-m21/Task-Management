"use client";

import { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch users when authenticated and user is admin
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Fetch all users (admin only)
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  // Get a single user by ID
  const getUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/users/${userId}`);
      setLoading(false);
      return { success: true, user: response.data };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to fetch user");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to fetch user",
      };
    }
  };

  // Create a new user (admin only)
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/users", userData);
      setUsers([...users, response.data]);
      setLoading(false);
      return { success: true, user: response.data };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to create user");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to create user",
      };
    }
  };

  // Update an existing user (admin only)
  const updateUser = async (userId, userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      setUsers(
        users.map((user) => (user._id === userId ? response.data : user))
      );
      setLoading(false);
      return { success: true, user: response.data };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to update user");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to update user",
      };
    }
  };

  // Delete a user (admin only)
  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to delete user");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to delete user",
      };
    }
  };

  const value = {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
