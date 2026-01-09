import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Auth Signup
    const { data: { user }, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // 2. Profile DB Insert
    if (user) {
      const { error: dbError } = await supabase.from('profiles').insert([{ 
        id: user.id, 
        email: email, 
        role: role 
      }]);

      if (dbError) {
        console.error(dbError);
        alert('Signup success, but profile failed. Contact Admin.');
      } else {
        alert('Account Created! Please Login.');
        navigate('/login');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>Create Account 🚀</h2>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px' }} />
          
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: 'white' }}>
            <option value="citizen">Citizen</option>
            <option value="employee">Government Employee</option>
          </select>

          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' }}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;