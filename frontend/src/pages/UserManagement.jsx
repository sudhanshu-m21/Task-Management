import { UserProvider } from "../contexts/UserContext"
import UserList from "../components/UserList"

const UserManagement = () => {
  return (
    <UserProvider>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <UserList />
      </div>
    </UserProvider>
  )
}

export default UserManagement
