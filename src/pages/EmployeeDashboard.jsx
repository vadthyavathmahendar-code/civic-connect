import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');
      
      // Fetch tasks assigned to this employee's email
      const { data } = await supabase.from('complaints').select('*').eq('assigned_to', user.email);
      setTasks(data || []);
    };
    fetchTasks();
  }, [navigate]);

  const markResolved = async (id) => {
    await supabase.from('complaints').update({ status: 'Resolved' }).eq('id', id);
    alert('Task Resolved!');
    window.location.reload();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>👷 My Tasks</h1>
      <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ marginBottom: '20px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px' }}>Logout</button>
      
      {tasks.length === 0 ? <p>No tasks assigned yet.</p> : tasks.map(t => (
        <div key={t.id} style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
          <h3>{t.title}</h3>
          <p>{t.description}</p>
          <p><strong>Location:</strong> {t.location}</p>
          {t.status !== 'Resolved' && (
            <button onClick={() => markResolved(t.id)} style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              ✅ Mark as Done
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmployeeDashboard;