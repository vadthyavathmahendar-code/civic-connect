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

  const openMap = (loc) => window.open(`https://www.google.com/maps/search/?api=1&query=$${loc.replace('Lat:', '').replace('Long:', '')}`, '_blank');

  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("Please provide reply and proof image.");
    setSubmitting(true);
    const fileName = `proof_${Date.now()}_${proofImage.name}`;
    await supabase.storage.from('complaint_images').upload(fileName, proofImage);
    const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
    
    await supabase.from('complaints').update({ status: 'Resolved', admin_reply: replyText, resolve_image_url: data.publicUrl }).eq('id', id);
    alert('Job Resolved!');
    setResolvingId(null); setReplyText(''); setProofImage(null); setSubmitting(false);
    fetchTasks(workerDetails.email);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div><h1 style={{ margin: 0 }}>👷 My Tasks</h1><p style={{ margin: 0, color: '#64748b' }}>{workerDetails.email}</p></div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Logout</button>
      </div>
      
      {tasks.map(t => (
        <div key={t.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>{t.category}</h3><span style={{ padding: '5px 10px', borderRadius: '15px', background: t.status === 'Resolved' ? '#dcfce7' : '#fef3c7' }}>{t.status}</span></div>
          <p>{t.description}</p>
          {t.image_url && <img src={t.image_url} alt="Issue" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />}
          
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
            <p style={{ margin: '0 0 10px' }}><strong>📍 Location:</strong> {t.location}</p>
            <button onClick={() => openMap(t.location)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>🗺️ Navigate</button>
          </div>

          {t.status !== 'Resolved' && (
            resolvingId === t.id ? (
              <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
                <textarea placeholder="What did you fix?" value={replyText} onChange={e => setReplyText(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
                <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '10px' }} />
                <button onClick={() => handleResolveSubmit(t.id)} disabled={submitting} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px' }}>{submitting ? 'Uploading...' : 'Submit Proof'}</button>
              </div>
            ) : (
              <button onClick={() => setResolvingId(t.id)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px' }}>✅ Mark Done</button>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default EmployeeDashboard;