import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      // 1. Get Session from Browser Memory (Fast & Persistent)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return navigate('/');
      }

      // 2. Check Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') {
        return navigate('/');
      }

      setAdminEmail(session.user.email);
      fetchData(); 
      setLoading(false);

      // --- REAL-TIME LISTENER ---
      const subscription = supabase
        .channel('admin_complaints')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
          fetchData(); // Reload data immediately on change
        })
        .subscribe();

      return () => { supabase.removeChannel(subscription); };
    };

    fetchSession();
  }, [navigate]);

  const fetchData = async () => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    const all = data || [];
    setComplaints(all);
    setFilteredComplaints(all);
    calculateStats(all);
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter(c => c.status !== 'Resolved').length,
      resolved: data.filter(c => c.status === 'Resolved').length
    });
  };

  // Filter Logic
  useEffect(() => {
    let result = complaints;
    if (filterStatus !== 'All') result = result.filter(c => c.status === filterStatus);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => c.title?.toLowerCase().includes(lower) || c.category?.toLowerCase().includes(lower));
    }
    setFilteredComplaints(result);
  }, [searchTerm, filterStatus, complaints]);

  const handleAssign = async (id, email) => {
    if(!email) return alert('Enter worker email');
    await supabase.from('complaints').update({ assigned_to: email, status: 'In Progress' }).eq('id', id);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete report?")) return;
    await supabase.from('complaints').delete().eq('id', id);
  };

  if (loading) return <div className="spinner-blue"></div>;

  return (
    <div className="container fade-in">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>🛡️</div>
          <div><h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Portal</h1><p style={{ margin: 0, color: '#64748b' }}>{adminEmail}</p></div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger">Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ borderLeft: '5px solid #3b82f6' }}><h3>TOTAL</h3><span style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total}</span></div>
        <div className="card" style={{ borderLeft: '5px solid #f59e0b' }}><h3>ACTIVE</h3><span style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.pending}</span></div>
        <div className="card" style={{ borderLeft: '5px solid #10b981' }}><h3>DONE</h3><span style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.resolved}</span></div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '150px' }}>
          <option>All</option><option>Pending</option><option>In Progress</option><option>Resolved</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {filteredComplaints.length === 0 ? <div className="empty-state">No reports found.</div> : filteredComplaints.map(c => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{c.category}</span>
              <span className={`badge status-${c.status.replace(' ','')}`}>{c.status}</span>
            </div>
            {c.image_url && <img src={c.image_url} alt="Proof" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />}
            <h4 style={{ margin: '0 0 5px' }}>{c.title}</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{c.description}</p>
            
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginTop: '15px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Assign To:</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input id={`assign-${c.id}`} placeholder="worker@gov.in" defaultValue={c.assigned_to || ''} style={{ background:'white', padding:'8px' }} />
                <button onClick={() => handleAssign(c.id, document.getElementById(`assign-${c.id}`).value)} className="btn btn-primary" style={{ padding: '5px 15px' }}>Set</button>
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} className="btn" style={{ width: '100%', marginTop: '10px', color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;