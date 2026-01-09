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
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/');
      
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'employee') return navigate('/');

      setWorkerDetails({ name: user.email.split('@')[0], email: user.email });
      fetchTasks(user.email);
    };
    checkAndFetch();
  }, [navigate]);

  const fetchTasks = async (email) => {
    const { data } = await supabase.from('complaints').select('*').eq('assigned_to', email).order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const openMap = (loc) => {
    if(!loc) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${loc.replace('Lat:', '').replace('Long:', '')}`, '_blank');
  };

  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("Please provide reply and proof image.");
    setSubmitting(true);
    
    const fileName = `proof_${Date.now()}_${proofImage.name}`;
    await supabase.storage.from('complaint_images').upload(fileName, proofImage);
    const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
    
    await supabase.from('complaints').update({ 
      status: 'Resolved', 
      admin_reply: replyText, 
      resolve_image_url: data.publicUrl 
    }).eq('id', id);

    alert('✅ Job Resolved Successfully!');
    setResolvingId(null); setReplyText(''); setProofImage(null); setSubmitting(false);
    fetchTasks(workerDetails.email);
  };

  return (
    <div className="container fade-in">
      {/* --- HEADER --- */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', background: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}>
            👷
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Field Operations</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Worker: <strong>{workerDetails.email}</strong></p>
          </div>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn btn-danger">
          Logout
        </button>
      </div>
      
      {/* --- TASKS GRID --- */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <h2>🎉 No pending tasks!</h2>
          <p>You have completed all your assigned work.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {tasks.map(t => (
            <div key={t.id} className="card">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>{t.category}</span>
                <span className={`badge status-${t.status.replace(' ', '')}`}>{t.status}</span>
              </div>
              
              <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '15px' }}>{t.description}</p>
              
              {t.image_url && (
                <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                  <img src={t.image_url} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              {/* ACTIONS AREA */}
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#64748b' }}>📍 <strong>Location:</strong> {t.location}</p>
                <button onClick={() => openMap(t.location)} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                  🗺️ Navigate with Maps
                </button>
              </div>

              {t.status !== 'Resolved' && (
                resolvingId === t.id ? (
                  <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#166534' }}>✅ Complete Job</h4>
                    <textarea placeholder="Describe the fix..." value={replyText} onChange={e => setReplyText(e.target.value)} rows="3" style={{ marginBottom: '10px' }} />
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#166534' }}>Upload Proof Photo:</label>
                    <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '10px', background: 'white' }} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleResolveSubmit(t.id)} disabled={submitting} className="btn" style={{ flex: 1, background: '#16a34a', color: 'white' }}>
                        {submitting ? 'Saving...' : 'Submit'}
                      </button>
                      <button onClick={() => setResolvingId(null)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setResolvingId(t.id)} className="btn" style={{ width: '100%', background: '#10b981', color: 'white' }}>
                    ✅ Mark Job as Done
                  </button>
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