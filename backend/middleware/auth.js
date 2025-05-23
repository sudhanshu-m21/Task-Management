import jwt from "jsonwebtoken"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"
import User from "../models/User.js"

// Protect routes
export const protect = catchAsync(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization
  let token

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("Not authorized to access this route", 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return next(new AppError("User not found", 401))
    }

    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401))
  }
})

// Authorize by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}
