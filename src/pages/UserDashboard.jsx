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
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('citizen') 

  const [submitting, setSubmitting] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [myComplaints, setMyComplaints] = useState([])
  
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
      } else {
        setUserName(session.user.email.split('@')[0]) 
        
        // Fetch Role
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
    const { data } = await supabase.from('complaints').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setMyComplaints(data || [])
    setFetching(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}`),
        () => alert("Location Fetched!")
      )
    } else {
      alert("Geolocation not supported")
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
        { title, description: desc, location, category, image_url: imageUrl, user_id: user.id, status: 'Pending' }
      ])

      if (error) throw error

      alert("Complaint Submitted!")
      setTitle(''); setDesc(''); setLocation(''); setImage(null);
      fetchMyComplaints(user.id)

    } catch (error) {
      console.error(error)
      alert("Error submitting complaint")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>👋 User Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}>Logout</button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2>📢 Report Issue</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px' }}/>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px' }}>
            <option value="Roads">Roads</option>
            <option value="Garbage">Garbage</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required style={{ padding: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, padding: '10px' }} />
            <button type="button" onClick={getLocation} style={{ padding: '10px' }}>📍 GPS</button>
          </div>
          <input type="file" onChange={e => setImage(e.target.files[0])} />
          <button type="submit" disabled={submitting} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      <h3>📂 My History</h3>
      {fetching ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {myComplaints.map(item => (
            <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', background: 'white' }}>
              <h4>{item.title} <small>({item.status})</small></h4>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserDashboard