"use client"

import { useState } from "react"
import { TaskProvider } from "../contexts/TaskContext"
import { UserProvider } from "../contexts/UserContext"
import TaskList from "../components/TaskList"
import TaskForm from "../components/TaskForm"
import { useTasks } from "../contexts/TaskContext"

const TaskFormWrapper = () => {
  const { createTask } = useTasks()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCreateTask = async (taskData, documents) => {
    setIsLoading(true)
    setError(null)

    const result = await createTask(taskData, documents)

    setIsLoading(false)

    if (result.success) {
      setIsModalOpen(false)
    } else {
      setError(result.error)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create Task
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            {error && <p className="mb-4 text-red-600">{error}</p>}
            <TaskForm onSubmit={handleCreateTask} buttonText={isLoading ? "Creating..." : "Create Task"} />
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const Dashboard = () => {
  return (
    <UserProvider>
      <TaskProvider>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Task Dashboard</h1>
            <TaskFormWrapper />
          </div>
          <TaskList />
        </div>
      </TaskProvider>
    </UserProvider>
  )
}

export default Dashboard
