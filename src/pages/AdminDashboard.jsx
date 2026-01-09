import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Get Admin Details
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setAdminEmail(user.email);

    // 2. Get Complaints
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    const all = data || [];
    setComplaints(all);

    // 3. Calculate Stats
    setStats({
      total: all.length,
      pending: all.filter(c => c.status !== 'Resolved').length,
      resolved: all.filter(c => c.status === 'Resolved').length
    });
  };

  const handleAssign = async (id, email) => {
    if(!email) return alert('Enter worker email');
    await supabase.from('complaints').update({ assigned_to: email, status: 'In Progress' }).eq('id', id);
    alert(`Assigned to ${email}`);
    fetchData();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this report?")) return;
    await supabase.from('complaints').delete().eq('id', id);
    fetchData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER WITH PROFILE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b' }}>🛡️ Admin Control</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>
            Logged in as: <strong>{adminEmail.split('@')[0]}</strong> ({adminEmail})
          </p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#3b82f6', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Total Reports</h3>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</span>
        </div>
        <div style={{ background: '#f59e0b', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Pending / In Progress</h3>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</span>
        </div>
        <div style={{ background: '#10b981', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Resolved</h3>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.resolved}</span>
        </div>
      </div>
      
      {/* COMPLAINTS LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{c.category}</span>
              <span style={{ padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', background: c.status === 'Resolved' ? '#dcfce7' : '#fee2e2', color: c.status === 'Resolved' ? '#166534' : '#991b1b' }}>{c.status}</span>
            </div>
            
            <p style={{ color: '#475569', fontSize: '0.95rem' }}>{c.description}</p>
            {c.location && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>📍 {c.location}</p>}
            
            {c.image_url && <img src={c.image_url} alt="Proof" style={{ width: '100%', borderRadius: '8px', height: '180px', objectFit: 'cover', marginTop: '10px' }} />}
            
            <div style={{ marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#64748b' }}>Assign to Employee:</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input id={`input-${c.id}`} placeholder="worker@gov.in" defaultValue={c.assigned_to || ''} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                <button onClick={() => handleAssign(c.id, document.getElementById(`input-${c.id}`).value)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}>Assign</button>
              </div>
            </div>

            <button onClick={() => handleDelete(c.id)} style={{ width: '100%', marginTop: '15px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>🗑 Delete Report</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;