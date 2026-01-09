import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', points: 0 });
  const [pageLoading, setPageLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setPageLoading(false); return navigate('/'); }

      const { data: profile } = await supabase.from('profiles').select('points').eq('id', session.user.id).single();
      
      setUser({ 
        name: session.user.email.split('@')[0], 
        email: session.user.email,
        points: profile?.points || 0
      });

      fetchHistory(session.user.id);
      setPageLoading(false);
    };
    fetchSession();
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
    const { data: { session } } = await supabase.auth.getSession();
    
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}_${image.name}`;
      await supabase.storage.from('complaint_images').upload(fileName, image);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    await supabase.from('complaints').insert([{
      user_id: session.user.id, title: formData.title, description: formData.desc, 
      category: formData.category, location: formData.location, image_url: imageUrl, status: 'Pending'
    }]);

    setLoading(false); setFormData({ title: '', desc: '', location: '', category: 'Roads' }); setImage(null);
    alert("Report Submitted! You will earn points once it is resolved.");
    fetchHistory(session.user.id);
  };

  const getBadge = (points) => {
    if (points >= 500) return '🦸‍♂️ Legend';
    if (points >= 200) return '🛡️ Guardian';
    if (points >= 50) return '⭐ Contributor';
    return '🌱 Rookie';
  };

  if (pageLoading) return <div className="spinner-blue"></div>;

  return (
    <div className="container fade-in">
      <div className="dashboard-header" style={{ gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
          <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>{user.name.charAt(0).toUpperCase()}</div>
          <div><h2 style={{ margin: 0, textTransform: 'capitalize' }}>{user.name}</h2><p style={{ margin: 0, color: 'var(--secondary)' }}>{user.email}</p></div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#f0f9ff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
          <div style={{ textAlign: 'center' }}><span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#0284c7' }}>SCORE</span><span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0ea5e9' }}>{user.points}</span></div>
          <div style={{ height: '40px', width: '1px', background: '#cbd5e1' }}></div>
          <div style={{ textAlign: 'center' }}><span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#0284c7' }}>RANK</span><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0ea5e9' }}>{getBadge(user.points)}</span></div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger">Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>📝 New Report</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Roads</option><option>Garbage</option><option>Water</option><option>Electricity</option></select>
            <textarea placeholder="Description..." rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required />
            <div style={{ display: 'flex', gap: '10px' }}><input placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required /><button type="button" onClick={handleGPS} className="btn btn-secondary">{gpsLoading ? '...' : '📍 GPS'}</button></div>
            <input type="file" onChange={e => setImage(e.target.files[0])} />
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : '🚀 Submit Report'}</button>
          </form>
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>📜 History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {complaints.map(c => (
              <div key={c.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{c.category}</span><span className={`badge status-${c.status.replace(' ', '')}`}>{c.status}</span></div>
                <h4 style={{ margin: '5px 0' }}>{c.title}</h4>
                {c.status === 'Resolved' && <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold' }}>🎉 +50 Points Earned!</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;