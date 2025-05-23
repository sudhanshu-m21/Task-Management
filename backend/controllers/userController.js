import User from "../models/User.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
export const getUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.status(200).json(users)
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin or Self
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError("User not found", 404))
  }

  res.status(200).json(user)
})

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
  res.status(200).json(user)
})

// @desc    Create a new user
// @route   POST /api/users
// @access  Admin
export const createUser = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return next(new AppError("User already exists", 400))
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    role,
  })

  res.status(201).json(user)
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
export const updateUser = catchAsync(async (req, res, next) => {
  const { email, role } = req.body

  // Find user
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError("User not found", 404))
  }

  // Update user fields
  if (email) user.email = email
  if (role) user.role = role

  await user.save()

  res.status(200).json(user)
})

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const { email, currentPassword, newPassword } = req.body

  // Find user
  const user = await User.findById(req.user.id)

  // Update email if provided
  if (email) user.email = email

  // Update password if provided
  if (newPassword) {
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return next(new AppError("Current password is incorrect", 401))
    }

    user.password = newPassword
  }

  await user.save()

  res.status(200).json(user)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError("User not found", 404))
  }

  await user.remove()

  res.status(200).json({ success: true })
})
