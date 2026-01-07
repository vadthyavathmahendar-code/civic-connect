import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="animate-fade">
      {/* 1. HERO SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        color: 'white',
        padding: '5rem 2rem',
        textAlign: 'center',
        borderRadius: '0 0 50% 50% / 4rem' // Curved bottom edge
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800' }}>
          Civic Connect
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Empowering citizens to report issues, track progress, and build better cities together.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login">
            <button className="btn" style={{ background: 'white', color: '#4f46e5', padding: '15px 30px', fontSize: '1.1rem' }}>
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '15px 30px', fontSize: '1.1rem' }}>
              Sign Up
            </button>
          </Link>
        </div>
      </div>

      {/* 2. FEATURES SECTION */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>How It Works</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {/* Feature 1 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
            <h3>Report Issues</h3>
            <p style={{ color: '#666' }}>
              Spot a pothole or garbage pile? Snap a photo, add the location, and report it in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
            <h3>Track Status</h3>
            <p style={{ color: '#666' }}>
              Don't wonder what happened. Get real-time updates when the government sees and fixes your issue.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3>See Proof</h3>
            <p style={{ color: '#666' }}>
              Transparency matters. View "Proof of Work" photos uploaded by officials when the job is done.
            </p>
          </div>
        </div>
      </div>
      
      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#999', marginTop: '2rem' }}>
        &copy; 2026 Civic Connect Project. Built for Better Cities.
      </footer>
    </div>
  )
}

export default LandingPage