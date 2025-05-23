"use client"

import { useState, useEffect } from "react"
import { useUsers } from "../contexts/UserContext"

const TaskForm = ({ task, onSubmit, buttonText = "Submit" }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("pending")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [documents, setDocuments] = useState([])
  const [errors, setErrors] = useState({})

  const { users, loading: usersLoading } = useUsers()

  // If editing, populate form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "pending")
      setPriority(task.priority || "medium")
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")
      setAssignedTo(task.assignedTo?._id || task.assignedTo || "")
    }
  }, [task])

  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required"
    }

    if (!assignedTo) {
      newErrors.assignedTo = "Assigned user is required"
    }

    if (documents.length > 3) {
      newErrors.documents = "Maximum 3 documents allowed"
    }

    // Check file types
    for (let i = 0; i < documents.length; i++) {
      if (documents[i].type !== "application/pdf") {
        newErrors.documents = "Only PDF files are allowed"
        break
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      const taskData = {
        title,
        description,
        status,
        priority,
        dueDate,
        assignedTo,
      }

      onSubmit(taskData, documents)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length > 3) {
      setErrors({ ...errors, documents: "Maximum 3 documents allowed" })
      return
    }

    // Check file types
    for (let i = 0; i < files.length; i++) {
      if (files[i].type !== "application/pdf") {
        setErrors({ ...errors, documents: "Only PDF files are allowed" })
        return
      }
    }

    setDocuments(files)
    setErrors({ ...errors, documents: null })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
            errors.title ? "border-red-500" : ""
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.dueDate ? "border-red-500" : ""
            }`}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
            Assigned To
          </label>
          <select
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.assignedTo ? "border-red-500" : ""
            }`}
          >
            <option value="">Select User</option>
            {!usersLoading &&
              users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
          </select>
          {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="documents" className="block text-sm font-medium text-gray-700">
          Documents (PDF only, max 3)
        </label>
        <input
          type="file"
          id="documents"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className={`mt-1 block w-full ${errors.documents ? "border-red-500" : ""}`}
        />
        {errors.documents && <p className="mt-1 text-sm text-red-600">{errors.documents}</p>}
        {documents.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Selected files:</p>
            <ul className="list-disc pl-5 text-sm">
              {Array.from(documents).map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
