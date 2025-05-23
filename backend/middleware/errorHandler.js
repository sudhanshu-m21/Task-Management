import { AppError } from "../utils/appError.js"

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error for development
  console.error(err)

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found"
    error = new AppError(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = new AppError(message, 400)
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = new AppError(message, 400)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    error = new AppError(message, 401)
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    error = new AppError(message, 401)
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large (max 5MB)"
    error = new AppError(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  })
}
