import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'employee' && secretCode !== 'CITYWORKER') {
      alert("🚫 Access Denied: Incorrect Employee Code."); setLoading(false); return;
    }
    if (role === 'admin' && secretCode !== 'ADMINMASTER') {
      alert("🚫 Access Denied: Incorrect Admin Code."); setLoading(false); return;
    }

    const { data: { user }, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) { alert(authError.message); setLoading(false); return; }

    if (user) {
      await supabase.from('profiles').insert([{ id: user.id, email: email, role: role }]);
      alert('✅ Account Created! Please Login.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'white' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>Join Civic Connect</h1>
          <p style={{ color: '#64748b' }}>Create an account to start reporting.</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>I am a:</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="citizen">Citizen</option>
              <option value="employee">Government Employee</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          {role !== 'citizen' && (
            <div style={{ animation: 'fadeIn 0.3s', background: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
              <label style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '5px', display:'block' }}>🔒 Security Verification Code:</label>
              <input type="password" placeholder="Enter Secret Code" value={secretCode} onChange={e => setSecretCode(e.target.value)} style={{ borderColor: '#ef4444' }} />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '25px', color: '#64748b', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;