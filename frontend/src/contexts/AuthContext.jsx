"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token")

      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/api/users/me")
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (err) {
          console.error("Authentication error:", err)
          localStorage.removeItem("token")
          delete api.defaults.headers.common["Authorization"]
        }
      }

      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Register user
  const register = async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/api/auth/register", userData)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
      setIsAuthenticated(true)
      setLoading(false)

      return { success: true }
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Registration failed")
      return { success: false, error: err.response?.data?.message || "Registration failed" }
    }
  }

  // Login user
  const login = async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post("/api/auth/login", credentials)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setUser(user)
      setIsAuthenticated(true)
      setLoading(false)

      return { success: true }
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Login failed")
      return { success: false, error: err.response?.data?.message || "Login failed" }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    setIsAuthenticated(false)
  }

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.put("/api/users/me", userData)
      setUser(response.data)
      setLoading(false)
      return { success: true }
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Profile update failed")
      return { success: false, error: err.response?.data?.message || "Profile update failed" }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
