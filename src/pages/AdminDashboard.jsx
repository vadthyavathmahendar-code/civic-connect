import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
      setComplaints(data || []);
    };
    fetch();
  }, []);

  const handleAssign = async (id, email) => {
    if(!email) return alert('Enter email');
    await supabase.from('complaints').update({ assigned_to: email, status: 'In Progress' }).eq('id', id);
    alert('Assigned!');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>🛡️ Admin Control</h1>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '5px' }}>Logout</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{c.category}</h3>
              <span style={{ fontWeight: 'bold', color: c.status === 'Resolved' ? 'green' : 'orange' }}>{c.status}</span>
            </div>
            <p>{c.description}</p>
            {c.image_url && <img src={c.image_url} alt="Proof" style={{ width: '100%', borderRadius: '5px', height: '150px', objectFit: 'cover' }} />}
            
            <div style={{ marginTop: '15px', background: '#f8fafc', padding: '10px', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px', fontSize: '0.9rem', color: '#64748b' }}>Assign to Employee:</p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input id={`input-${c.id}`} placeholder="worker@gov.in" style={{ flex: 1, padding: '5px' }} />
                <button onClick={() => handleAssign(c.id, document.getElementById(`input-${c.id}`).value)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '3px', padding: '5px 10px' }}>Assign</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;