import User from "../models/User.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError("User already exists", 400))
  }

  // Create new user
  const user = await User.create({
    email,
    password,
  })

  // Generate JWT token
  const token = user.generateAuthToken()

  res.status(201).json({
    success: true,
    token,
    user,
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }

  // Find user by email
  const user = await User.findOne({ email })
  if (!user) {
    return next(new AppError("Invalid credentials", 401))
  }

  // Check if password is correct
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return next(new AppError("Invalid credentials", 401))
  }

  // Generate JWT token
  const token = user.generateAuthToken()

  res.status(200).json({
    success: true,
    token,
    user,
  })
})
