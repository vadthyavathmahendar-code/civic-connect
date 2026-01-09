import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [user, setUser] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');
      setUser({ name: user.email.split('@')[0], email: user.email });
      fetchHistory(user.id);
    };
    init();
  }, [navigate]);

  const fetchHistory = async (id) => {
    const { data } = await supabase.from('complaints').select('*').eq('user_id', id).order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return alert("GPS not supported");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setFormData({ ...formData, location: `Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}` }); setGpsLoading(false); },
      () => { alert("Permission denied"); setGpsLoading(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}_${image.name}`;
      await supabase.storage.from('complaint_images').upload(fileName, image);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    await supabase.from('complaints').insert([{
      user_id: user.id, title: formData.title, description: formData.desc, 
      category: formData.category, location: formData.location, image_url: imageUrl, status: 'Pending'
    }]);

    setLoading(false); setFormData({ title: '', desc: '', location: '', category: 'Roads' }); setImage(null);
    fetchHistory(user.id);
    alert("Report Submitted Successfully!");
  };

  return (
    <div className="container fade-in">
      {/* HEADER */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'capitalize' }}>{user.name}</h2>
            <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>Citizen Account</p>
          </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* FORM SECTION */}
        <div className="card">
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>📝 New Report</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <input placeholder="Issue Title (e.g. Broken Light)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ flex: 1 }}>
                <option>Roads</option><option>Garbage</option><option>Water</option><option>Electricity</option>
              </select>
            </div>

            <textarea placeholder="Describe the issue details..." rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Location Address" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              <button type="button" onClick={handleGPS} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                {gpsLoading ? '...' : '📍 GPS'}
              </button>
            </div>

            <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }} onClick={() => document.getElementById('fileUpload').click()}>
              <p style={{ margin: 0, color: '#64748b' }}>{image ? `📸 ${image.name}` : 'Click to Upload Photo'}</p>
              <input id="fileUpload" type="file" onChange={e => setImage(e.target.files[0])} style={{ display: 'none' }} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
              {loading ? 'Submitting...' : '🚀 Submit Report'}
            </button>
          </form>
        </div>

        {/* HISTORY SECTION */}
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>📜 Recent History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {complaints.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No reports yet. You're a model citizen!</p>}
            
            {complaints.map(c => (
              <div key={c.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{c.category}</span>
                  <span className={`badge status-${c.status.replace(' ', '')}`}>{c.status}</span>
                </div>
                <h3 style={{ margin: '0 0 5px', fontSize: '1.1rem' }}>{c.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 15px' }}>{new Date(c.created_at).toLocaleDateString()}</p>
                
                {/* NEW FEATURE: STATUS PROGRESS BAR */}
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: c.status === 'Resolved' ? '100%' : c.status === 'In Progress' ? '50%' : '10%', 
                    background: c.status === 'Resolved' ? 'var(--success)' : c.status === 'In Progress' ? 'var(--warning)' : 'var(--danger)',
                    transition: 'width 0.5s ease' 
                  }}></div>
                </div>

                {c.status === 'Resolved' && (
                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}><strong>Reply:</strong> {c.admin_reply}</p>
                    {c.resolve_image_url && (
                       <a href={c.resolve_image_url} target="_blank" style={{ display: 'block', marginTop: '8px', fontSize: '0.85rem', color: '#166534', fontWeight: 'bold', textDecoration: 'none' }}>
                         👁️ View Proof of Work
                       </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;