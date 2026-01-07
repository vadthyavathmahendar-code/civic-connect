import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('citizen')
  const [adminCode, setAdminCode] = useState('')
  const [loading, setLoading] = useState(false)
  
  // NEW: State for Custom Popup (Toast)
  const [notification, setNotification] = useState(null)

  const navigate = useNavigate()
  const SECRET_ADMIN_KEY = "CITY-ADMIN-2026"

  // Helper function to show the fancy popup
  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. SECURITY CHECK
      if (role === 'admin' && adminCode !== SECRET_ADMIN_KEY) {
        showToast("ACCESS DENIED: Incorrect Govt Code!", "error") // Custom Popup
        setLoading(false)
        return
      }

      // 2. Create User
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) throw error

      // 3. Save Role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, role: role, email: email }])

        if (profileError) throw profileError

        // Success Message
        showToast("Signup successful! Check your email.", "success")
        
        // Wait 2 seconds so they can read the message before redirecting
        setTimeout(() => {
            navigate('/login')
        }, 2000)
      }
    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade" style={{ maxWidth: '500px', marginTop: '50px' }}>
      
      {/* 🔔 THE TOAST NOTIFICATION CONTAINER */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            {notification.type === 'success' ? '✅' : '❌'} {notification.message}
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '10px' }}>🚀 Create Account</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Join us to make the city better.</p>

        <form onSubmit={handleSignup} autoComplete="off">
          <div style={{ textAlign: 'left' }}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label>I am a...</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '12px', width: '100%', border: '1px solid #ccc', borderRadius: '8px', background: 'white', marginBottom:'1rem' }}
            >
              <option value="citizen">👤 Citizen (Report Issues)</option>
              <option value="admin">🏛️ Govt Official (Admin)</option>
            </select>
          </div>

          {role === 'admin' && (
            <div style={{ textAlign: 'left', animation: 'fadeIn 0.5s' }}>
              <label style={{ color: '#ef4444', fontWeight: 'bold' }}>🔒 Enter Official Secret Code</label>
              <input 
                type="password" 
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Ask your supervisor for the code"
                style={{ borderColor: '#ef4444' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup