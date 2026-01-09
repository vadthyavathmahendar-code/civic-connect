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

    // 1. Sign up the user in Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    // 2. Add the user details to 'profiles' table (FIXED)
    if (user) {
      const { error: dbError } = await supabase
        .from('profiles') // <--- CHANGED TO 'profiles'
        .insert([
          { 
            email: email, 
            role: role 
          }
        ]);

      if (dbError) {
        console.error('Error saving user data:', dbError);
        alert('Signup successful, but failed to save role. Please contact support.');
      } else {
        alert('Signup successful! Please log in.');
        navigate('/'); 
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333' }}>Create Account 🚀</h2>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: 'white' }}
        >
          <option value="citizen">Citizen</option>
          <option value="employee">Government Employee (Field Worker)</option>
        </select>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Already have an account? <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Log in here</Link>
      </p>
    </div>
  );
};

export default Signup;