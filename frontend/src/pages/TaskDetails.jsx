"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { TaskProvider, useTasks } from "../contexts/TaskContext"
import { UserProvider } from "../contexts/UserContext"
import TaskForm from "../components/TaskForm"
import { useAuth } from "../contexts/AuthContext"

const TaskDetailsContent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getTask, updateTask, deleteTask, loading: taskLoading } = useTasks()
  const { user } = useAuth()

  const [task, setTask] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true)
      const result = await getTask(id)
      setLoading(false)

      if (result.success) {
        setTask(result.task)
      } else {
        setError(result.error)
      }
    }

    fetchTask()
  }, [id, getTask])

  const handleUpdateTask = async (taskData, documents) => {
    const result = await updateTask(id, taskData, documents)

    if (result.success) {
      setTask(result.task)
      setIsEditModalOpen(false)
    } else {
      setError(result.error)
    }
  }

  const handleDeleteTask = async () => {
    const result = await deleteTask(id)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.error)
    }
  }

  const canEdit = user && (user.role === "admin" || (task && task.assignedTo && task.assignedTo._id === user._id))

  if (loading || taskLoading) {
    return <div className="text-center py-8">Loading task details...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
  }

  if (!task) {
    return <div className="text-center py-8">Task not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Task
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Task
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <p className="font-medium">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium">{task.assignedTo?.email || "Unassigned"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">{new Date(task.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(task.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{task.description || "No description provided."}</p>

            <h3 className="text-lg font-semibold mt-6 mb-4">Documents</h3>
            {task.documents && task.documents.length > 0 ? (
              <ul className="space-y-2">
                {task.documents.map((doc, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      ></path>
                    </svg>
                    <a
                      href={`/api/tasks/${task._id}/documents/${doc._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.originalName || `Document ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents attached.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            <TaskForm task={task} onSubmit={handleUpdateTask} buttonText="Update Task" />
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Task</h3>
            <p className="mb-4">
              Are you sure you want to delete the task <span className="font-semibold">{task.title}</span>? This action
              cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteTask}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const TaskDetails = () => {
  return (
    <UserProvider>
      <TaskProvider>
        <TaskDetailsContent />
      </TaskProvider>
    </UserProvider>
  )
}

export default TaskDetails
