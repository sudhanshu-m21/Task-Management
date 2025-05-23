import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskDocument,
  deleteTaskDocument,
} from "../controllers/taskController.js"
import { protect } from "../middleware/auth.js"

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true)
  } else {
    cb(new Error("Only PDF files are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

const router = express.Router()

// Protect all routes
router.use(protect)

router.route("/").get(getTasks).post(upload.array("documents", 3), createTask)

router.route("/:id").get(getTaskById).put(upload.array("documents", 3), updateTask).delete(deleteTask)

router.route("/:id/documents/:docId").get(getTaskDocument).delete(deleteTaskDocument)

export default router
