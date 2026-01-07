import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LandingPage from './pages/LandingPage' // Import the new page

function App() {
  return (
    <Routes>
      {/* The "/" path now points to LandingPage instead of Login */}
      <Route path="/" element={<LandingPage />} />
      
      {/* We moved Login to its own path */}
      <Route path="/login" element={<Login />} />
      
      <Route path="/signup" element={<Signup />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App