import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- ASSIGNMENT LOGIC ---
  const handleAssign = async (id, employeeEmail) => {
    if (!employeeEmail) return alert("Please enter an employee email!");

    const { error } = await supabase
      .from('complaints')
      .update({ 
        assigned_to: employeeEmail,
        status: 'In Progress' 
      })
      .eq('id', id);

    if (error) {
      alert('Failed to assign task.');
    } else {
      alert(`Task assigned to ${employeeEmail}`);
      fetchComplaints();
    }
  };

  const handleResolve = async (id) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'Resolved' })
      .eq('id', id);

    if (error) console.error('Error resolving:', error);
    else fetchComplaints();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🛡️ Admin Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            style={{ 
              marginRight: '10px', padding: '8px 12px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer',
              background: filter === status ? '#007bff' : 'white',
              color: filter === status ? 'white' : 'black'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Complaints Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredComplaints.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{item.category || 'Issue'}</span>
              <span style={{ 
                padding: '4px 8px', borderRadius: '5px', fontSize: '0.8rem',
                backgroundColor: item.status === 'Resolved' ? '#d4edda' : item.status === 'In Progress' ? '#fff3cd' : '#f8d7da'
              }}>
                {item.status}
              </span>
            </div>

            {item.image_url && <img src={item.image_url} alt="Proof" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />}
            
            <p style={{ fontSize: '0.9rem', color: '#555' }}>{item.description}</p>
            
            {item.location && (
              <a href={`http://maps.google.com/?q=${encodeURIComponent(item.location.replace('Lat:', '').replace('Long:', ''))}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '10px', color: '#007bff' }}>
                📍 Open Location Map
              </a>
            )}

            {/* ASSIGNMENT SECTION */}
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
              {item.assigned_to ? (
                <small>👷 Assigned to: <strong>{item.assigned_to}</strong></small>
              ) : (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="text" id={`assign-${item.id}`} placeholder="Worker Email" style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '3px' }} />
                  <button onClick={() => handleAssign(item.id, document.getElementById(`assign-${item.id}`).value)} style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Assign</button>
                </div>
              )}
            </div>

            {item.status !== 'Resolved' && (
              <button onClick={() => handleResolve(item.id)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                ✅ Mark Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;