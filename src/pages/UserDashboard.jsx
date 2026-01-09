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
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');
    
    const { data } = await supabase.from('complaints').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
      user_id: user.id, title, description: desc, category, location, image_url: imageUrl, status: 'Pending'
    }]);

    alert('Report Submitted!');
    setLoading(false);
    setTitle(''); setDesc(''); setLocation(''); setImage(null);
    fetchHistory();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1e293b' }}>👤 My Dashboard</h1>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none' }}>Logout</button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h2 style={{ marginTop: 0 }}>📢 Report Issue</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <input type="text" placeholder="Title (e.g., Broken Light)" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '6px' }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '6px' }}>
            <option>Roads</option><option>Garbage</option><option>Water</option><option>Electricity</option>
          </select>
          <textarea placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} required rows="3" style={{ padding: '10px', borderRadius: '6px' }} />
          <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required style={{ padding: '10px', borderRadius: '6px' }} />
          <input type="file" onChange={e => setImage(e.target.files[0])} />
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      <h3>📜 Previous Reports</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px' }}>{c.title}</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{c.category} • {new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: c.status === 'Resolved' ? '#dcfce7' : '#fee2e2', color: c.status === 'Resolved' ? '#166534' : '#991b1b' }}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;