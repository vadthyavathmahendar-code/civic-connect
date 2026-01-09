import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  
  // Resolution State
  const [resolvingId, setResolvingId] = useState(null); // Which ID are we working on?
  const [replyText, setReplyText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/');
    
    setWorkerDetails({ name: user.email.split('@')[0], email: user.email });

    const { data } = await supabase.from('complaints').select('*').eq('assigned_to', user.email).order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const openMap = (locationStr) => {
    if (!locationStr) return;
    const query = locationStr.replace('Lat:', '').replace('Long:', '').trim();
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleResolveSubmit = async (id) => {
    if (!replyText) return alert("Please write a reply explaining what you did.");
    if (!proofImage) return alert("Please upload a proof image.");
    
    setSubmitting(true);

    try {
      // 1. Upload Proof Image
      const fileName = `proof_${Date.now()}_${proofImage.name}`;
      await supabase.storage.from('complaint_images').upload(fileName, proofImage);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      const proofUrl = data.publicUrl;

      // 2. Update Database
      const { error } = await supabase.from('complaints').update({ 
        status: 'Resolved',
        admin_reply: replyText,
        resolve_image_url: proofUrl
      }).eq('id', id);

      if (error) throw error;

      alert('Great work! Job marked as Done.');
      setResolvingId(null); // Close form
      setReplyText('');
      setProofImage(null);
      fetchTasks(); // Refresh list

    } catch (error) {
      console.error(error);
      alert('Error updating task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>👷 My Tasks</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>
            Logged in as: <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{workerDetails.name}</span>
          </p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      {/* TASKS LIST */}
      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#94a3b8' }}>
          <h3>No pending tasks.</h3>
          <p>You are all caught up!</p>
        </div>
      ) : (
        tasks.map(t => (
          <div key={t.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            
            {/* CARD HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b' }}>{t.category} Issue</h3>
              <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', background: t.status === 'Resolved' ? '#dcfce7' : '#fef3c7', color: t.status === 'Resolved' ? '#166534' : '#d97706' }}>
                {t.status}
              </span>
            </div>

            <p style={{ color: '#475569', lineHeight: '1.6' }}>{t.description}</p>
            {t.image_url && <img src={t.image_url} alt="Issue" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}

            {/* LOCATION & MAP */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#64748b' }}><strong>📍 Location:</strong> {t.location}</p>
              <button onClick={() => openMap(t.location)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                🗺️ Navigate to Location
              </button>
            </div>

            {/* RESOLUTION SECTION */}
            {t.status !== 'Resolved' && (
              <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                {resolvingId === t.id ? (
                  // --- ACTIVE RESOLUTION FORM ---
                  <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#166534' }}>✅ Complete Job</h4>
                    
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Worker Reply:</label>
                    <textarea 
                      placeholder="Describe what you fixed (e.g. Filled pothole with cement)..." 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Proof (Photo):</label>
                    <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '15px' }} />

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleResolveSubmit(t.id)} disabled={submitting} style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                        {submitting ? 'Uploading...' : 'Submit & Close Ticket'}
                      </button>
                      <button onClick={() => setResolvingId(null)} style={{ padding: '10px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  // --- START BUTTON ---
                  <button onClick={() => { setResolvingId(t.id); setReplyText(''); setProofImage(null); }} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                    ✅ Mark Job as Done
                  </button>
                )}
              </div>
            )}
            
            {/* SHOW RESOLVED PROOF (If already resolved) */}
            {t.status === 'Resolved' && t.admin_reply && (
              <div style={{ marginTop: '15px', background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#166534' }}>🎉 Job Completed!</p>
                <p style={{ margin: 0, color: '#14532d' }}>"{t.admin_reply}"</p>
                {t.resolve_image_url && <img src={t.resolve_image_url} alt="Proof" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', marginTop: '10px', border: '2px solid #bbf7d0' }} />}
              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeDashboard;