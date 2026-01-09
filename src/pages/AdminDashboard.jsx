import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // To filter Pending/Resolved
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching data:', error);
    else setComplaints(data);
    setLoading(false);
  };

  // --- NEW: Function to Assign Employee ---
  const handleAssign = async (id, employeeEmail) => {
    if (!employeeEmail) return alert("Please enter an employee email!");

    const { error } = await supabase
      .from('complaints')
      .update({ 
        assigned_to: employeeEmail,
        status: 'In Progress' // Updates status automatically
      })
      .eq('id', id);

    if (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task.');
    } else {
      alert(`Task successfully assigned to ${employeeEmail}`);
      fetchComplaints(); // Refresh list to show the change
    }
  };

  // --- Existing: Function to Resolve ---
  const handleResolve = async (id) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'Resolved' })
      .eq('id', id);

    if (error) console.error('Error resolving:', error);
    else fetchComplaints();
  };

  // Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Filter Logic
  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Admin Dashboard 🛡️</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <div style={cardStyle}>Total: {complaints.length}</div>
        <div style={{ ...cardStyle, background: '#e2e6ea' }}>Pending: {complaints.filter(c => c.status === 'Pending').length}</div>
        <div style={{ ...cardStyle, background: '#d4edda' }}>Resolved: {complaints.filter(c => c.status === 'Resolved').length}</div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            style={{ 
              marginRight: '10px', 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: '1px solid #ccc',
              background: filter === status ? '#007bff' : 'white',
              color: filter === status ? 'white' : 'black',
              cursor: 'pointer'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Complaints Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredComplaints.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', background: 'white' }}>
            
            {/* Header: Category & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.category || 'Issue'}</span>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '5px', 
                fontSize: '0.8rem',
                backgroundColor: item.status === 'Resolved' ? '#d4edda' : item.status === 'In Progress' ? '#fff3cd' : '#f8d7da',
                color: item.status === 'Resolved' ? '#155724' : item.status === 'In Progress' ? '#856404' : '#721c24'
              }}>
                {item.status}
              </span>
            </div>

            {/* Image */}
            {item.image_url && (
              <img 
                src={item.image_url} 
                alt="Complaint" 
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} 
              />
            )}

            {/* Location (Clickable Map) */}
            {item.location && (
              <div style={{ marginBottom: '10px' }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    item.location.replace('Lat:', '').replace('Long:', '').trim()
                  )}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  📍 {item.location.slice(0, 25)}... <span style={{fontSize:'0.8rem', textDecoration:'underline'}}>(Open Map ↗)</span>
                </a>
              </div>
            )}

            {/* Description */}
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '15px' }}>
              {item.description || 'No description provided.'}
            </p>

            {/* --- NEW: ASSIGNMENT SECTION --- */}
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
              {item.assigned_to ? (
                // If already assigned, show name
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>👷 Assigned to:</strong> <br/>
                  <span style={{ color: '#007bff' }}>{item.assigned_to}</span>
                </div>
              ) : (
                // If not assigned, show input
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input 
                    type="text" 
                    id={`assign-input-${item.id}`}
                    placeholder="Worker Email..." 
                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                  />
                  <button 
                    onClick={() => {
                      const email = document.getElementById(`assign-input-${item.id}`).value;
                      handleAssign(item.id, email);
                    }}
                    style={{ padding: '6px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>

            {/* Resolve Button */}
            {item.status !== 'Resolved' && (
              <button 
                onClick={() => handleResolve(item.id)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✅ Mark Resolved
              </button>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

// Simple reusable style for the top stats cards
const cardStyle = {
  flex: 1,
  padding: '20px',
  borderRadius: '10px',
  background: '#f8f9fa',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

export default AdminDashboard;