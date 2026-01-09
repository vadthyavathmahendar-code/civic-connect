import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
      
      {/* HERO SECTION */}
      <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
        <div style={{ display: 'inline-block', padding: '8px 16px', background: '#dbeafe', color: '#1e40af', borderRadius: '30px', fontWeight: '600', fontSize: '0.9rem', marginBottom: '20px' }}>
          🚀 The Future of City Management
        </div>
        <h1 style={{ fontSize: '4rem', margin: '0 0 20px', fontWeight: '900', letterSpacing: '-2px', background: '-webkit-linear-gradient(45deg, #2563eb, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Civic Connect
        </h1>
        <h2 style={{ fontSize: '2rem', color: '#334155', fontWeight: '700', marginBottom: '20px' }}>
          See it. Click it. <span style={{ textDecoration: 'underline', textDecorationColor: '#2563eb' }}>Fix it.</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#64748b', lineHeight: '1.6', marginBottom: '40px' }}>
          Empowering citizens to build better cities. Report issues instantly, track real-time progress, and watch your neighborhood transform.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            Login Now
          </button>
          <button onClick={() => navigate('/signup')} className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            Create Account
          </button>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', width: '100%', maxWidth: '1200px' }}>
        <FeatureCard icon="📸" title="Snap & Upload" desc="Spotted a pothole? Take a photo. Our AI-ready system tags the location instantly." />
        <FeatureCard icon="🛰️" title="GPS Precision" desc="We use advanced geolocation to pinpoint exactly where repairs are needed." />
        <FeatureCard icon="✅" title="Verified Proof" desc="Don't just take our word for it. See 'Before & After' photos when jobs are done." />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ textAlign: 'left' }}>
    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 10px', fontSize: '1.5rem', color: '#1e293b' }}>{title}</h3>
    <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6' }}>{desc}</p>
  </div>
);

export default Home;