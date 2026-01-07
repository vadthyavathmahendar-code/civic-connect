import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const UserDashboard = () => {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Roads')
  const [image, setImage] = useState(null)
  
  // User Details
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('citizen') // NEW: Store Role

  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [myComplaints, setMyComplaints] = useState([])
  const [notification, setNotification] = useState(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
      } else {
        const email = session.user.email
        setUserEmail(email)
        setUserName(email.split('@')[0]) 
        
        // 1. FETCH ROLE
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUserRole(profile?.role || 'citizen')

        fetchMyComplaints(session.user.id)
      }
    }
    checkUser()
  }, [navigate])

  const fetchMyComplaints = async (userId) => {
    const { data } = await supabase.from('complaints').select('*').eq('user_id', userId).order('id', { ascending: false })
    setMyComplaints(data || [])
    setFetching(false)
  }

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}`),
        () => showToast("Could not get location", "error")
      )
    } else {
      showToast("Geolocation not supported", "error")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = null

      if (image) {
        const fileName = `${Math.random()}.${image.name.split('.').pop()}`
        await supabase.storage.from('complaint_images').upload(fileName, image)
        const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      const { error } = await supabase.from('complaints').insert([
        { title, description: desc, location, category, image_url: imageUrl, user_id: user.id, status: 'pending' }
      ])

      if (error) throw error

      showToast("Complaint Submitted!", "success")
      setTitle(''); setDesc(''); setLocation(''); setImage(null);
      fetchMyComplaints(user.id)

    } catch (error) {
      showToast(error.message, "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container animate-fade">
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            {notification.type === 'success' ? '✅' : '❌'} {notification.message}
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="header-flex" style={{ alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>👋 Civic Connect</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* NEW: ADMIN BUTTON (Only visible to Admins) */}
          {userRole === 'admin' && (
            <button 
              onClick={() => navigate('/admin-dashboard')} 
              className="btn btn-primary" 
              style={{ padding: '8px 15px', fontSize: '0.9rem' }}
            >
              🛡️ Admin Panel
            </button>
          )}

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'capitalize' }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {userEmail}
            </div>
          </div>

          <div style={{ 
            width: '40px', height: '40px', 
            background: '#4f46e5', color: 'white', 
            borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: '1.2rem' 
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>

          <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 15px', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '30px' }}>
        
        {/* REPORT FORM */}
        <div className="card">
          <h2>📢 Report a New Problem</h2>
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input type="text" placeholder="e.g. Broken Streetlight" value={title} onChange={e => setTitle(e.target.value)} required />
            
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
              <option value="Roads">🛣️ Roads & Potholes</option>
              <option value="Garbage">🗑️ Garbage Collection</option>
              <option value="Water">💧 Water Supply</option>
              <option value="Electricity">⚡ Electricity</option>
              <option value="Other">❓ Other</option>
            </select>

            <label>Description</label>
            <textarea placeholder="Describe the issue..." value={desc} onChange={e => setDesc(e.target.value)} required rows="3" />
            
            <label>Location</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Address or GPS" value={location} onChange={e => setLocation(e.target.value)} required />
              <button type="button" onClick={getLocation} className="btn btn-location" style={{whiteSpace:'nowrap'}}>📍 GPS</button>
            </div>
            
            <label>Photo Evidence (Optional)</label>
            <input type="file" onChange={e => setImage(e.target.files[0])} />

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderLeftColor: 'white', borderWidth: '3px' }}></div>
                  Submitting...
                </>
              ) : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* HISTORY LIST */}
        <div className="card">
          <h2>📂 My Complaints</h2>
          {fetching ? (
            <div className="loading-screen" style={{ padding: '2rem' }}>
              <div className="spinner"></div> Loading your history...
            </div>
          ) : (
            <div>
              {myComplaints.length === 0 ? <p style={{color:'#666'}}>No reports yet.</p> : null}
              {myComplaints.map(item => (
                <div key={item.id} className="history-item" style={{display:'block'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <h3 style={{margin:0}}>{item.title}</h3>
                      <small style={{color:'#666'}}>{item.category} • {new Date(item.created_at).toLocaleDateString()}</small>
                    </div>
                    <span className={`status-badge status-${item.status}`}>{item.status}</span>
                  </div>
                  {item.status === 'resolved' && (
                    <div style={{marginTop:'15px', background:'#f0fdf4', padding:'15px', borderRadius:'8px', borderLeft:'4px solid #10b981'}}>
                      <p style={{margin:'0 0 10px 0'}}><strong>👮 Govt Reply:</strong> {item.admin_reply}</p>
                      {item.resolve_image_url && (
                        <div style={{marginTop:'10px'}}>
                          <div style={{fontSize:'0.85rem', fontWeight:'bold', color:'#059669', marginBottom:'5px'}}>✅ PROOF OF WORK:</div>
                          <img src={item.resolve_image_url} alt="Proof" style={{maxWidth:'100%', maxHeight:'200px', borderRadius:'8px', border:'1px solid #a7f3d0'}} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default UserDashboard