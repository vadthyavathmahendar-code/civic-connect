import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HERO SECTION */}
      <div style={{ maxWidth: '800px', animation: 'fadeIn 0.8s ease-out' }}>
        
        {/* BRAND NAME */}
        <h1 style={{ fontSize: '4.5rem', margin: '0 0 10px', color: '#2563eb', fontWeight: '900', letterSpacing: '-2px' }}>
          Civic Connect
        </h1>
        
        {/* NEW CATCHY TAGLINE */}
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 20px', color: '#1e293b', fontWeight: '800' }}>
          See it. Click it. <span style={{ color: '#2563eb', textDecoration: 'underline' }}>Fix it.</span>
        </h2>
        
        {/* SUBTEXT (The "Bridging the Gap" line you also liked) */}
        <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6' }}>
          Bridging the gap between citizens and authorities. 
          Snap a picture of the issue, and we handle the rest.
        </p>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ padding: '16px 45px', fontSize: '1.1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '50px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            Login
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            style={{ padding: '16px 45px', fontSize: '1.1rem', background: 'white', color: '#1e293b', border: '2px solid #e2e8f0', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={{ marginTop: '100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', width: '100%', maxWidth: '1100px', textAlign: 'left' }}>
        <FeatureCard icon="👀" title="1. See it" desc="Spot a pothole, garbage, or broken light in your neighborhood." />
        <FeatureCard icon="📸" title="2. Click it" desc="Snap a photo and upload it. We auto-detect your location." />
        <FeatureCard icon="🛠️" title="3. Fix it" desc="Authorities get notified instantly and resolve the issue fast." />
      </div>
    </div>
  );
};

// Helper Component for Cards
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px', color: '#334155', fontSize: '1.4rem' }}>{title}</h3>
    <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

export default Home;