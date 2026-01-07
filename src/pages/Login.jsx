import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null) // New Toast State
  const navigate = useNavigate()

  useEffect(() => {
    setEmail('')
    setPassword('')
  }, [])

  // Helper for popup
  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        showToast("Login Successful!", "success")

        // Small delay so user sees the success message
        setTimeout(() => {
          if (profile?.role === 'admin') {
            navigate('/admin-dashboard')
          } else {
            navigate('/user-dashboard')
          }
        }, 1000)
      }
    } catch (error) {
      showToast(error.message, "error") // Nice red popup
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container animate-fade" style={{ maxWidth: '500px', marginTop: '50px' }}>
      
      {/* 🔔 TOAST CONTAINER */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            {notification.type === 'success' ? '✅' : '❌'} {notification.message}
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>🔐 Login to Civic Connect</h2>
        
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ textAlign: 'left' }}>
            <label>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="new-password"
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#666' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Signup here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login