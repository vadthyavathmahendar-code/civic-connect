import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    // 1. Get the currently logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    // 2. Fetch complaints assigned ONLY to this email
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_to', user.email) // <--- THE FILTER
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching tasks:', error);
    else setTasks(data);
    setLoading(false);
  };

  const markResolved = async (id) => {
    // Upload proof logic can be added here later
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'Resolved' })
      .eq('id', id);
    
    if (!error) {
      alert("Great job! Task marked as Resolved.");
      fetchMyTasks();
    }
  };

  if (loading) return <p>Loading your tasks...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>👷 My Work Orders</h2>
      {tasks.length === 0 ? (
        <p>No tasks assigned to you yet. Enjoy your break! ☕</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
              <h3>{task.category || 'General Issue'}</h3>
              <p><strong>📍 Location:</strong> {task.location}</p>
              <p><strong>📝 Description:</strong> {task.description}</p>
              
              {/* Show Status */}
              <p>Status: <span style={{ fontWeight: 'bold', color: task.status === 'Resolved' ? 'green' : 'orange' }}>{task.status}</span></p>

              {/* Action Button */}
              {task.status !== 'Resolved' && (
                <button 
                  onClick={() => markResolved(task.id)}
                  style={{ marginTop: '10px', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  ✅ Mark as Fixed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;