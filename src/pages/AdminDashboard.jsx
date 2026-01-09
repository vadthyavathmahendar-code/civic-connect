import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/'); 

      // SECURITY CHECK
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') return navigate('/');

      setAdminEmail(user.email);
      fetchData();
    };
    checkAndFetch();
  }, [navigate]);

  const fetchData = async () => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    const all = data || [];
    setComplaints(all);
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
    if(!window.confirm("Delete this report?")) return;
    await supabase.from('complaints').delete().eq('id', id);
    fetchData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div><h1 style={{ margin: 0 }}>🛡️ Admin Control</h1><p style={{ margin: 0, color: '#64748b' }}>{adminEmail}</p></div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#3b82f6', color: 'white', padding: '20px', borderRadius: '10px' }}><h3>Total</h3><h1>{stats.total}</h1></div>
        <div style={{ background: '#f59e0b', color: 'white', padding: '20px', borderRadius: '10px' }}><h3>Pending</h3><h1>{stats.pending}</h1></div>
        <div style={{ background: '#10b981', color: 'white', padding: '20px', borderRadius: '10px' }}><h3>Resolved</h3><h1>{stats.resolved}</h1></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {complaints.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{c.category}</h3>
              <span style={{ padding: '5px 10px', borderRadius: '15px', background: c.status === 'Resolved' ? '#dcfce7' : '#fee2e2' }}>{c.status}</span>
            </div>
            <p>{c.description}</p>
            {c.image_url && <img src={c.image_url} alt="Proof" style={{ width: '100%', borderRadius: '8px', height: '180px', objectFit: 'cover' }} />}
            <div style={{ marginTop: '15px', background: '#f8fafc', padding: '10px' }}>
              <p style={{margin:'0 0 5px', fontSize:'0.9rem'}}>Assign To:</p>
              <div style={{display:'flex', gap:'5px'}}>
                <input id={`assign-${c.id}`} placeholder="worker@gov.in" defaultValue={c.assigned_to || ''} style={{flex:1, padding:'5px'}} />
                <button onClick={() => handleAssign(c.id, document.getElementById(`assign-${c.id}`).value)} style={{background:'#2563eb', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>Assign</button>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} style={{ width: '100%', marginTop: '10px', color: '#ef4444', background: 'none', border: '1px solid #ef4444', padding: '5px', borderRadius: '4px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;