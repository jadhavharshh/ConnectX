import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { JSX } from 'react'
import './App.css'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'
import Error from './pages/Error/Error'
import LoginPage from './pages/Auth/Auth'
import { useUser } from '@clerk/clerk-react'
import Announcement from './pages/Announcements/Announcement'
import Profile from './pages/Profile/Profile'
import Chat from './pages/Chat/Chat'
import Settings from './pages/Settings/Settings'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    // Optionally, replace this with a spinner or loading component.
    return <div>Loading...</div>
  }

  if (!user?.id) {
    return <Navigate to="/auth" />
  }
  
  return children
}

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    // Optionally, replace this with a spinner or loading component.
    return <div>Loading...</div>
  }

  if (user?.id) {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

function App() {  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/auth" element={<AuthRoute><LoginPage /></AuthRoute>}/>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
        <Route path="/announcements" element={<PrivateRoute><Announcement /></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>}/>
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>}/>
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>}/>
        <Route path="/404" element={<Error />} />
        <Route path='*' element={<Navigate to="/404" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App