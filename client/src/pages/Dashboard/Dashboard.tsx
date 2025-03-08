import { ModeToggle } from "@/components/mode-toggle"
import { LogoutButton } from "./Logout-btn"

const Dashboard = () => {
  return (
    <div>
      <h1>TREIAL</h1>
       <ModeToggle />
       <LogoutButton />
    </div>
  )
}

export default Dashboard