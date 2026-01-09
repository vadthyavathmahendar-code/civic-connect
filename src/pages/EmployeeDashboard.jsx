import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');
      
      setWorkerDetails({
        name: user.email.split('@')[0],
        email: user.email
      });

      // Fetch tasks assigned to this employee
      const { data } = await supabase.from('complaints').select('*').eq('assigned_to', user.email).order('created_at', { ascending: false });
      setTasks(data || []);
    };
    fetchTasks();
  }, [navigate]);

  const markResolved = async (id) => {
    if(!window.confirm("Mark this task as completed?")) return;
    await supabase.from('complaints').update({ status: 'Resolved' }).eq('id', id);
    alert('Great work! Task Resolved.');
    window.location.reload();
  };

  const openMap = (locationStr) => {
    if (!locationStr) return;
    // Tries to clean up "Lat: 123, Long: 456" into a Google Maps query
    const query = locationStr.replace('Lat:', '').replace('Long:', '').trim();
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* WORKER HEADER */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>👷 My Tasks</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>
            Worker: <span style={{ color: '#2563eb', fontWeight: 'bold', textTransform: 'capitalize' }}>{workerDetails.name}</span>
            <br/><span style={{ fontSize: '0.85rem' }}>{workerDetails.email}</span>
          </p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#94a3b8' }}>
          <h3>No pending tasks.</h3>
          <p>Relax! You have no assigned work right now.</p>
        </div>
      ) : (
        tasks.map(t => (
          <div key={t.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>{t.category} Issue</h3>
              <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', background: t.status === 'Resolved' ? '#dcfce7' : '#fef3c7', color: t.status === 'Resolved' ? '#166534' : '#d97706' }}>
                {t.status}
              </span>
            </div>

            <p style={{ color: '#475569', lineHeight: '1.6' }}>{t.description}</p>
            
            {t.image_url && (
              <img src={t.image_url} alt="Problem" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', margin: '15px 0' }} />
            )}

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#64748b' }}><strong>📍 Location:</strong> {t.location}</p>
              <button 
                onClick={() => openMap(t.location)}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                🗺️ Navigate to Location
              </button>
            </div>

            {t.status !== 'Resolved' && (
              <button onClick={() => markResolved(t.id)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                ✅ Mark Job as Done
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeDashboard;