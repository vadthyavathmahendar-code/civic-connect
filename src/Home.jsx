import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
      
      <div style={{ maxWidth: '600px', animation: 'fadeIn 0.8s ease-out' }}>
        <h1 style={{ fontSize: '3.5rem', margin: '0 0 20px', color: '#1e293b', lineHeight: 1.1 }}>
          Fix Your City <br />
          <span style={{ color: '#2563eb' }}>In One Click.</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '40px' }}>
          Civic Connect bridges the gap between citizens and authorities. 
          Report potholes, garbage, and lights instantly.
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ padding: '15px 40px', fontSize: '1.1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '50px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            style={{ padding: '15px 40px', fontSize: '1.1rem', background: 'white', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '50px' }}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', maxWidth: '900px', textAlign: 'left' }}>
        <FeatureCard icon="📸" title="Snap & Upload" desc="Take a photo of the issue. AI auto-tags the category." />
        <FeatureCard icon="📍" title="GPS Location" desc="We pinpoint exactly where the repair is needed." />
        <FeatureCard icon="✅" title="Track Status" desc="Get notified when the government fixes it." />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ padding: '25px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px', color: '#334155' }}>{title}</h3>
    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>{desc}</p>
  </div>
);

export default Home;