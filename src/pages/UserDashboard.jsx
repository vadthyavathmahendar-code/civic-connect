import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Roads');
  const [image, setImage] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');
      setUserDetails({ name: user.email.split('@')[0], email: user.email });
      fetchHistory(user.id);
    };
    checkAndFetch();
  }, [navigate]);

  const fetchHistory = async (id) => {
    const { data } = await supabase.from('complaints').select('*').eq('user_id', id).order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation(`Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}`); setGpsLoading(false); },
      () => { alert("Denied."); setGpsLoading(false); }
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
    await supabase.from('complaints').insert([{ user_id: user.id, title, description: desc, category, location, image_url: imageUrl, status: 'Pending' }]);
    alert('Report Submitted!');
    setLoading(false); setTitle(''); setDesc(''); setLocation(''); setImage(null);
    fetchHistory(user.id);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div><h2>{userDetails.name}</h2><p style={{ color: '#64748b' }}>{userDetails.email}</p></div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#f1f5f9', color: '#ef4444', padding: '10px 20px', borderRadius: '8px', border: 'none' }}>Logout</button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>📢 Report Issue</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background:'white' }}><option>Roads</option><option>Garbage</option><option>Water</option><option>Electricity</option></select>
          <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <div style={{ display: 'flex', gap: '10px' }}><input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} /><button type="button" onClick={handleGetLocation} style={{ padding: '0 20px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px' }}>{gpsLoading ? '...' : '📍 GPS'}</button></div>
          <input type="file" onChange={e => setImage(e.target.files[0])} />
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none' }}>{loading ? 'Submitting...' : 'Submit Report'}</button>
        </form>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h4>{c.title}</h4><span style={{ padding: '5px 10px', borderRadius: '15px', background: c.status === 'Resolved' ? '#dcfce7' : '#fee2e2' }}>{c.status}</span></div>
            {c.status === 'Resolved' && (
              <div style={{ marginTop: '15px', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 10px', color: '#14532d' }}><strong>Reply:</strong> {c.admin_reply}</p>
                {c.resolve_image_url && <img src={c.resolve_image_url} alt="Proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;