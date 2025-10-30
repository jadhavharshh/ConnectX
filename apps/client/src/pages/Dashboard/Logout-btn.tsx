
import { useClerk } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const clerk = useClerk()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await clerk.signOut()
    navigate("/login") // update the route as needed
  }

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  )
}