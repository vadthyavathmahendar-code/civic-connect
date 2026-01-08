import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState(null)
  
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  const [replyId, setReplyId] = useState(null) 
  const [replyText, setReplyText] = useState('')
  const [resolveImage, setResolveImage] = useState(null)

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
      }
    }
    checkUser()
    fetchComplaints() 
  }, [navigate])

  const fetchComplaints = async () => {
    const { data } = await supabase.from('complaints').select('*').order('id', { ascending: false })
    setComplaints(data || [])
  }

  const showToast = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const togglePriority = async (id, currentPriority) => {
    const newPriority = currentPriority === 'high' ? 'normal' : 'high'
    const { error } = await supabase.from('complaints').update({ priority: newPriority }).eq('id', id)
    if (error) showToast("Error updating priority", "error")
    else {
      showToast(newPriority === 'high' ? "Marked as High Priority! 🔥" : "Marked as Normal", "success")
      fetchComplaints()
    }
  }

  const downloadCSV = () => {
    const headers = ["ID", "Title", "Category", "Description", "Location", "Status", "Priority", "Date"]
    const rows = complaints.map(c => [
      c.id, `"${c.title}"`, c.category, `"${c.description}"`, `"${c.location}"`, c.status, c.priority, new Date(c.created_at).toLocaleDateString()
    ])
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "civic_report.csv"); document.body.appendChild(link); link.click()
  }

  const resolveWithProof = async (id) => {
    if (!replyText) { alert("Please write a remark."); return }
    try {
      let proofUrl = null
      if (resolveImage) {
        const fileName = `proof-${Math.random()}.${resolveImage.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage.from('complaint_images').upload(fileName, resolveImage)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName)
        proofUrl = data.publicUrl
      }
      const { error } = await supabase.from('complaints').update({ status: 'resolved', admin_reply: replyText, resolve_image_url: proofUrl }).eq('id', id)
      if (error) throw error
      showToast("Resolved with Proof!", "success")
      setReplyId(null); setReplyText(''); setResolveImage(null); fetchComplaints()
    } catch (error) { showToast("Error: " + error.message, "error") }
  }

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this?")) return;
    const { error } = await supabase.from('complaints').delete().eq('id', id)
    if (error) showToast("Error deleting", "error"); else { showToast("Deleted", "success"); fetchComplaints() }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/') }
  
  const total = complaints.length
  const pending = complaints.filter(c => c.status === 'pending').length
  const resolved = complaints.filter(c => c.status === 'resolved').length
  const urgent = complaints.filter(c => c.priority === 'high').length

  const categoryCounts = complaints.reduce((acc, curr) => {
    const cat = curr.category || 'Other'; 
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map(key => ({
    name: key, value: categoryCounts[key]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];

  const filtered = complaints.filter(c => {
    const matchesStatus = filter === 'all' || c.status === filter
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })
  filtered.sort((a, b) => (b.priority === 'high') - (a.priority === 'high'))

  return (
    <div className="container animate-fade">
      {notification && (
        <div className="toast-container"><div className={`toast ${notification.type}`}>{notification.type==='success'?'✅':'❌'} {notification.message}</div></div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>🛡️ Admin Control</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* NEW BUTTON: GO TO USER VIEW */}
          <button 
            onClick={() => navigate('/user-dashboard')} 
            className="btn btn-outline" 
            style={{ padding: '8px 15px', fontSize: '0.9rem' }}
          >
            📢 Report Issue
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'capitalize' }}>{userName || 'Admin'}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{userEmail}</div>
          </div>
          <div style={{ width: '40px', height: '40px', background: '#dc3545', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>{userName ? userName.charAt(0).toUpperCase() : 'A'}</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 15px', fontSize: '0.9rem', borderColor: '#dc3545', color: '#dc3545' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', alignContent: 'start' }}>
          <div className="stat-card" style={{ borderLeftColor: '#4f46e5' }}><h3>Total</h3><div className="stat-number">{total}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}><h3>Pending</h3><div className="stat-number">{pending}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}><h3>Resolved</h3><div className="stat-number">{resolved}</div></div>
          <div className="stat-card" style={{ borderLeftColor: '#ef4444', background: '#fef2f2' }}><h3 style={{color:'#ef4444'}}>🔥 Urgent</h3><div className="stat-number" style={{color:'#ef4444'}}>{urgent}</div></div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '10px' }}>📊 Issues by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#999' }}>No data to display yet.</p>
          )}
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <button onClick={() => setFilter('all')} className={`btn ${filter==='all'?'btn-active':'btn-outline'}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`btn ${filter==='pending'?'btn-active':'btn-outline'}`}>Pending</button>
          <button onClick={() => setFilter('resolved')} className={`btn ${filter==='resolved'?'btn-active':'btn-outline'}`}>Resolved</button>
          <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '200px', margin: 0, padding: '10px', height:'42px' }} />
        </div>
        <button onClick={downloadCSV} className="btn" style={{background:'#1f2937', color:'white', display:'flex', alignItems:'center', gap:'5px'}}>📥 Export CSV</button>
      </div>

      <div>
        {filtered.map(item => (
          <div key={item.id} className="card" style={{ borderLeft: `6px solid ${item.status==='resolved' ? '#10b981' : (item.priority==='high' ? '#ef4444' : '#f59e0b')}`, background: item.priority === 'high' && item.status !== 'resolved' ? '#fff5f5' : 'white' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div>
                <h3 style={{margin:0}}>{item.priority === 'high' && <span style={{marginRight:'5px'}}>🔥</span>}{item.title}</h3> 
                <span style={{background:'#eee', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem', marginLeft:'10px'}}>{item.category || 'General'}</span>
              </div>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <span className={`status-badge status-${item.status}`}>{item.status}</span>
                {item.status !== 'resolved' && (
                  <button onClick={() => togglePriority(item.id, item.priority)} title="Toggle Priority" style={{border:'none', background:'transparent', cursor:'pointer', fontSize:'1.2rem', opacity: item.priority === 'high' ? 1 : 0.3}}>🔥</button>
                )}
              </div>
            </div>
            
            <p>{item.description}</p>
           {item.location && (
  <div style={{ marginTop: '5px' }}>
    <a 
      href={`https://www.google.com/maps?q=${encodeURIComponent(
        item.location.replace('Lat:', '').replace('Long:', '').trim()
      )}`}
      target="_blank" 
      rel="noopener noreferrer"
      style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
    >
      📍 {item.location} <span style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>(Open Map ↗)</span>
    </a>
  </div>
)}
            {item.image_url && <div style={{ marginTop: '10px', marginBottom: '10px' }}><img src={item.image_url} alt="Evidence" style={{ maxHeight: '150px', borderRadius: '8px' }} /></div>}

            {item.status === 'resolved' ? (
              <div style={{marginTop:'15px', padding:'10px', background:'#f9fafb', border:'1px solid #eee', borderRadius:'5px'}}>
                <p style={{margin:'0 0 10px 0'}}><strong>✅ Resolution Note:</strong> {item.admin_reply}</p>
                {item.resolve_image_url && <div><small>Proof of Work:</small><br/><img src={item.resolve_image_url} alt="Proof" style={{height:'100px', borderRadius:'5px', marginTop:'5px'}}/></div>}
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {replyId === item.id ? (
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <input type="text" placeholder="Resolution note..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>📸 Upload Proof:</label>
                      <input type="file" onChange={(e) => setResolveImage(e.target.files[0])} />
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                      <button onClick={() => resolveWithProof(item.id)} className="btn" style={{background:'#10b981', color:'white'}}>Submit</button>
                      <button onClick={() => {setReplyId(null); setResolveImage(null)}} className="btn" style={{background:'#ccc'}}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={() => setReplyId(item.id)} className="btn" style={{ background:'#10b981', color:'white' }}>✅ Resolve</button>
                    <button onClick={() => handleDelete(item.id)} className="btn" style={{ background:'#ef4444', color:'white' }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
export default AdminDashboard