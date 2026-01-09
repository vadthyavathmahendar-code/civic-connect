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
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/'); 

      // SECURITY CHECK: Role = Admin?
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

  // --- FILTER & SEARCH LOGIC ---
  useEffect(() => {
    let result = complaints;

    // 1. Filter by Status
    if (filterStatus !== 'All') {
      result = result.filter(c => c.status === filterStatus);
    }

    // 2. Filter by Search (Title or Category)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.title?.toLowerCase().includes(lower) || 
        c.category?.toLowerCase().includes(lower) ||
        c.description?.toLowerCase().includes(lower)
      );
    }

    setFilteredComplaints(result);
  }, [searchTerm, filterStatus, complaints]);

  // --- ACTIONS ---
  const handleAssign = async (id, email) => {
    if(!email) return alert('Please enter a worker email');
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'In Progress' }).eq('id', id);
    if (error) alert("Error assigning task");
    else {
      alert(`✅ Task Assigned to ${email}`);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this report? This cannot be undone.")) return;
    await supabase.from('complaints').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="container fade-in">
      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)' }}>
            🛡️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Admin Portal</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Logged in as: <strong>{adminEmail}</strong></p>
          </div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger">
          Logout
        </button>
      </div>

      {/* --- STATS GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ borderLeft: '5px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Reports</h3>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{stats.total}</span>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>📊</div>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending / Active</h3>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{stats.pending}</span>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>⏳</div>
        </div>
        <div className="card" style={{ borderLeft: '5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Resolved</h3>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b' }}>{stats.resolved}</span>
          </div>
          <div style={{ fontSize: '2.5rem', opacity: 0.2 }}>✅</div>
        </div>
      </div>

      {/* --- CONTROLS (Search & Filter) --- */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Search reports..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '250px' }}
        />
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* --- COMPLAINTS LIST --- */}
      {filteredComplaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
          <h3>No reports found matching your criteria.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {filteredComplaints.map(c => (
            <div key={c.id} className="card" style={{ position: 'relative' }}>
              
              {/* STATUS BADGE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{c.category}</span>
                <span className={`badge status-${c.status.replace(' ', '')}`}>{c.status}</span>
              </div>

              {/* IMAGE */}
              {c.image_url ? (
                <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                  <img src={c.image_url} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ height: '80px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', marginBottom: '15px', border: '1px dashed #cbd5e1' }}>
                  No Image Provided
                </div>
              )}
              
              <h4 style={{ margin: '0 0 5px', color: '#334155' }}>{c.title || 'Untitled Issue'}</h4>
              <p style={{ margin: '0 0 15px', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{c.description}</p>

              {/* ASSIGNMENT SECTION */}
              <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '12px', marginTop: 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>
                  {c.assigned_to ? '👤 Assigned Worker:' : '⚠️ Unassigned'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    id={`assign-${c.id}`} 
                    placeholder="worker@gov.in" 
                    defaultValue={c.assigned_to || ''} 
                    style={{ padding: '8px', fontSize: '0.9rem', background: 'white' }}
                  />
                  <button 
                    onClick={() => handleAssign(c.id, document.getElementById(`assign-${c.id}`).value)} 
                    className="btn btn-primary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* DELETE BUTTON */}
              <button 
                onClick={() => handleDelete(c.id)} 
                style={{ 
                  marginTop: '15px', 
                  width: '100%', 
                  background: 'transparent', 
                  border: '1px solid #fee2e2', 
                  color: '#ef4444', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.target.style.background = '#fee2e2'; }}
                onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
              >
                🗑 Delete Report
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;