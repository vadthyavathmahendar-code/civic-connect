import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. ROBUST AUTH CHECK
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return navigate('/'); }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'employee') return navigate('/');

      setWorkerDetails({ name: session.user.email.split('@')[0], email: session.user.email });
      fetchTasks(session.user.email);
      setLoading(false);
    };

    checkUser();

    // 2. REAL-TIME LISTENER
    const subscription = supabase
      .channel('employee_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        // We can't easily get the 'current user email' inside the callback without refs, 
        // but re-running the checkUser logic handles it safely.
        supabase.auth.getUser().then(({ data: { user } }) => {
           if(user) fetchTasks(user.email);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [navigate]);

  const fetchTasks = async (email) => {
    const { data } = await supabase.from('complaints').select('*').eq('assigned_to', email).order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("Please provide reply and proof image.");
    setSubmitting(true);
    const fileName = `proof_${Date.now()}_${proofImage.name}`;
    await supabase.storage.from('complaint_images').upload(fileName, proofImage);
    const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
    
    // OPTIMISTIC UPDATE
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: 'Resolved' } : t);
    setTasks(updatedTasks);

    await supabase.from('complaints').update({ status: 'Resolved', admin_reply: replyText, resolve_image_url: data.publicUrl }).eq('id', id);
    setResolvingId(null); setReplyText(''); setProofImage(null); setSubmitting(false);
  };

  if (loading) return <div className="spinner-blue"></div>;

  return (
    <div className="container fade-in">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', background: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>👷</div>
          <div><h1 style={{ margin: 0, fontSize: '1.5rem' }}>Field Tasks</h1><p style={{ margin: 0, color: '#64748b' }}>{workerDetails.email}</p></div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger">Logout</button>
      </div>
      
      {tasks.length === 0 ? <div className="empty-state">No tasks assigned. Good job! 🎉</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {tasks.map(t => (
            <div key={t.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>{t.category}</span>
                <span className={`badge status-${t.status.replace(' ','')}`}>{t.status}</span>
              </div>
              <p>{t.description}</p>
              {t.image_url && <img src={t.image_url} alt="Issue" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}
              
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px' }}>📍 {t.location}</p>
                <button onClick={() => window.open(`http://maps.google.com/?q=${t.location.replace('Lat: ','').replace('Long: ','')}`, '_blank')} className="btn btn-secondary" style={{ width: '100%' }}>🗺️ Navigate</button>
              </div>

              {t.status !== 'Resolved' && (
                resolvingId === t.id ? (
                  <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#166534' }}>✅ Complete Job</h4>
                    <textarea placeholder="Fix details..." value={replyText} onChange={e => setReplyText(e.target.value)} rows="2" style={{ marginBottom: '10px' }} />
                    <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '10px', background: 'white' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleResolveSubmit(t.id)} className="btn" style={{ flex: 1, background: '#16a34a', color: 'white' }}>{submitting ? 'Saving...' : 'Submit'}</button>
                      <button onClick={() => setResolvingId(null)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setResolvingId(t.id)} className="btn" style={{ width: '100%', background: '#10b981', color: 'white' }}>✅ Mark Done</button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;