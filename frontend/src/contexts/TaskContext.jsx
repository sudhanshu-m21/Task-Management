"use client";

import { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dueDate: "",
    assignedTo: "",
  });
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const { isAuthenticated } = useAuth();

  // Fetch tasks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, filters, sortBy, sortOrder]);

  // Fetch tasks with filters and sorting
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);
      if (filters.dueDate) queryParams.append("dueDate", filters.dueDate);
      if (filters.assignedTo)
        queryParams.append("assignedTo", filters.assignedTo);

      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await api.get(`/api/tasks?${queryParams.toString()}`);
      // setTasks(response.data);
      // setLoading(false);
      // console.log("Fetched response.data:", response.data);

      const data = response.data;
      if (Array.isArray(data)) {
        setTasks(data);
      } else if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
        console.warn("No valid tasks array in response!");
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to fetch tasks");
    }
  };

  // Get a single task by ID
  const getTask = async (taskId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/tasks/${taskId}`);
      setLoading(false);
      return { success: true, task: response.data };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to fetch task");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to fetch task",
      };
    }
  };

  // Create a new task
  const createTask = async (taskData, documents) => {
    setLoading(true);
    setError(null);

    try {
      // Handle file uploads if any
      if (documents && documents.length > 0) {
        const formData = new FormData();

        // Append task data
        Object.keys(taskData).forEach((key) => {
          formData.append(key, taskData[key]);
        });

        // Append documents
        documents.forEach((doc) => {
          formData.append("documents", doc);
        });

        const response = await api.post("/api/tasks", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setTasks([...tasks, response.data]);
        setLoading(false);
        return { success: true, task: response.data };
      } else {
        // No documents to upload
        const response = await api.post("/api/tasks", taskData);
        setTasks([...tasks, response.data]);
        setLoading(false);
        return { success: true, task: response.data };
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to create task");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to create task",
      };
    }
  };

  // Update an existing task
  const updateTask = async (taskId, taskData, documents) => {
    setLoading(true);
    setError(null);

    try {
      // Handle file uploads if any
      if (documents && documents.length > 0) {
        const formData = new FormData();

        // Append task data
        Object.keys(taskData).forEach((key) => {
          formData.append(key, taskData[key]);
        });

        // Append documents
        documents.forEach((doc) => {
          formData.append("documents", doc);
        });

        const response = await api.put(`/api/tasks/${taskId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setTasks(
          tasks.map((task) => (task._id === taskId ? response.data : task))
        );
        setLoading(false);
        return { success: true, task: response.data };
      } else {
        // No documents to upload
        const response = await api.put(`/api/tasks/${taskId}`, taskData);
        setTasks(
          tasks.map((task) => (task._id === taskId ? response.data : task))
        );
        setLoading(false);
        return { success: true, task: response.data };
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to update task");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to update task",
      };
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to delete task");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to delete task",
      };
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Update sorting
  const updateSorting = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const value = {
    tasks,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    updateSorting,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
