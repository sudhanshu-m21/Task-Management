import express from "express"
import {
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateProfile,
  deleteUser,
} from "../controllers/userController.js"
import { protect, authorize } from "../middleware/auth.js"

const router = express.Router()

// Protected routes
router.use(protect)

// Current user routes
router.get("/me", getCurrentUser)
router.put("/me", updateProfile)

// Admin only routes
router.use(authorize("admin"))

router.route("/").get(getUsers).post(createUser)

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser)

export default router
