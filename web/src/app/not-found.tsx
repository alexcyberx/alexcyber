export default function NotFound() {
  return (
    <div className="page active">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'calc(var(--nav-h) + 60px) 24px 80px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 30, fontWeight: 700, color: '#f4f4f5', marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Ye page maujood nahi hai ya hata diya gaya hai.</p>
        <a className="nav-btn fill" href="/" style={{ display: 'inline-flex', textDecoration: 'none' }}>Back to Home</a>
      </div>
    </div>
  );
}
