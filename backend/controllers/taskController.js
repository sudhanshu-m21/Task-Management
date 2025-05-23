import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Task from "../models/Task.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Get all tasks with filtering and sorting
// @route   GET /api/tasks
// @access  Private
export const getTasks = catchAsync(async (req, res) => {
  const { status, priority, dueDate, assignedTo, sortBy, sortOrder } = req.query

  // Build filter object
  const filter = {}

  // Add filters if provided
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (dueDate) {
    const date = new Date(dueDate)
    filter.dueDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    }
  }

  // Filter by assigned user or created by user (if not admin)
  if (assignedTo) {
    filter.assignedTo = assignedTo
  } else if (req.user.role !== "admin") {
    filter.$or = [{ assignedTo: req.user.id }, { createdBy: req.user.id }]
  }

  // Build sort object
  const sort = {}
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1
  } else {
    sort.createdAt = -1 // Default sort by creation date (newest first)
  }

  // Execute query with pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const skip = (page - 1) * limit

  const tasks = await Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "email")
    .populate("createdBy", "email")

  // Get total count for pagination
  const total = await Task.countDocuments(filter)

  res.status(200).json({
    tasks,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  })
})

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate("assignedTo", "email").populate("createdBy", "email")

  if (!task) {
    return next(new AppError("Task not found", 404))
  }

  // Check if user has permission to view this task
  if (
    req.user.role !== "admin" &&
    task.assignedTo._id.toString() !== req.user.id &&
    task.createdBy._id.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized to access this task", 403))
  }

  res.status(200).json(task)
})

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = catchAsync(async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body

  // Create task
  const task = new Task({
    title,
    description,
    status,
    priority,
    dueDate,
    assignedTo,
    createdBy: req.user.id,
  })

  // Handle file uploads if any
  if (req.files && req.files.length > 0) {
    task.documents = req.files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      fileType: file.mimetype,
      filePath: file.path,
      fileSize: file.size,
    }))
  }

  await task.save()

  // Populate user information
  await task.populate("assignedTo", "email")
  await task.populate("createdBy", "email")

  res.status(201).json(task)
})

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = catchAsync(async (req, res, next) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body

  // Find task
  const task = await Task.findById(req.params.id)

  if (!task) {
    return next(new AppError("Task not found", 404))
  }

  // Check if user has permission to update this task
  if (
    req.user.role !== "admin" &&
    task.assignedTo.toString() !== req.user.id &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized to update this task", 403))
  }

  // Update task fields
  if (title) task.title = title
  if (description !== undefined) task.description = description
  if (status) task.status = status
  if (priority) task.priority = priority
  if (dueDate) task.dueDate = dueDate
  if (assignedTo) task.assignedTo = assignedTo

  // Handle file uploads if any
  if (req.files && req.files.length > 0) {
    // Add new documents
    const newDocuments = req.files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      fileType: file.mimetype,
      filePath: file.path,
      fileSize: file.size,
    }))

    task.documents = [...task.documents, ...newDocuments]
  }

  await task.save()

  // Populate user information
  await task.populate("assignedTo", "email")
  await task.populate("createdBy", "email")

  res.status(200).json(task)
})

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    return next(new AppError("Task not found", 404))
  }

  // Check if user has permission to delete this task
  if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
    return next(new AppError("Not authorized to delete this task", 403))
  }

  // Delete associated files
  if (task.documents && task.documents.length > 0) {
    task.documents.forEach((doc) => {
      const filePath = path.join(__dirname, "..", doc.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })
  }

  await task.remove()

  res.status(200).json({ success: true })
})

// @desc    Get task document
// @route   GET /api/tasks/:id/documents/:docId
// @access  Private
export const getTaskDocument = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    return next(new AppError("Task not found", 404))
  }

  // Check if user has permission to access this task
  if (
    req.user.role !== "admin" &&
    task.assignedTo.toString() !== req.user.id &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized to access this task", 403))
  }

  // Find the document
  const document = task.documents.id(req.params.docId)

  if (!document) {
    return next(new AppError("Document not found", 404))
  }

  // Send the file
  res.sendFile(path.resolve(document.filePath))
})

// @desc    Delete task document
// @route   DELETE /api/tasks/:id/documents/:docId
// @access  Private
export const deleteTaskDocument = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    return next(new AppError("Task not found", 404))
  }

  // Check if user has permission to update this task
  if (
    req.user.role !== "admin" &&
    task.assignedTo.toString() !== req.user.id &&
    task.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized to update this task", 403))
  }

  // Find the document
  const document = task.documents.id(req.params.docId)

  if (!document) {
    return next(new AppError("Document not found", 404))
  }

  // Delete the file
  const filePath = path.join(__dirname, "..", document.filePath)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Remove document from task
  task.documents.pull(req.params.docId)
  await task.save()

  res.status(200).json({ success: true })
})
