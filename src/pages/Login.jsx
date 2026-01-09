import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1. Authenticate with Supabase Auth
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // 2. FETCH ROLE from 'profiles' table
      const { data: userData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single(); 

      if (roleError) {
        console.error("Error fetching role:", roleError);
        navigate('/'); 
      } else if (userData) {
        // 3. REDIRECT BASED ON ROLE
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/'); // Citizen goes to Home
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
      <h2>Login 🔐</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;