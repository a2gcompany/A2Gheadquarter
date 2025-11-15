export default function TestPage() {
  return (
    <div style={{minHeight: '100vh', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem'}}>✅ Test Page Works!</h1>
        <p>If you see this, the server is running correctly.</p>
        <a href="/dashboard" style={{color: '#60a5fa', textDecoration: 'underline', marginTop: '1rem', display: 'block'}}>
          Go to Dashboard →
        </a>
      </div>
    </div>
  )
}
