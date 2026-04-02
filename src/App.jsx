import { useState, useEffect } from 'react'
import './index.css'

const WEBHOOK_URL = 'https://new-n8n-latest.duckdns.org/webhook-test/generate-resume'

function parseGeminiError(message) {
  const msg = (message || '').toLowerCase()
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
    return '🚦 Gemini API rate limit reached. You\'ve hit the free tier quota (1,500 req/day). Please wait a few minutes or try again tomorrow.'
  }
  if (msg.includes('403') || msg.includes('api_key') || msg.includes('permission')) {
    return '🔑 Gemini API key error. The API key in n8n may be invalid or expired. Please check your n8n credentials.'
  }
  if (msg.includes('500') || msg.includes('internal')) {
    return '⚙️ Gemini returned an internal server error. This is temporary — please try again in a moment.'
  }
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network')) {
    return '🌐 Could not reach the n8n server. Make sure your n8n instance is running and accessible.'
  }
  return null
}

export default function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [baseResume, setBaseResume] = useState(() => localStorage.getItem('base_resume_content') || '')
  const [recipientEmail, setRecipientEmail] = useState(() => localStorage.getItem('recipient_email') || "")
  const [status, setStatus] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    localStorage.setItem('base_resume_content', baseResume)
  }, [baseResume])

  useEffect(() => {
    localStorage.setItem('recipient_email', recipientEmail)
  }, [recipientEmail])

  const handleJDChange = (e) => {
    setJobDescription(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all data? This resets your resume, JD, and saved settings.')) {
      setJobDescription('')
      setCompanyName('')
      setBaseResume('')
      setCharCount(0)
      setStatus(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!baseResume.trim()) { setStatus('error'); setStatusMessage('Please provide your Base Resume content.'); return; }
    if (!recipientEmail.trim()) { setStatus('error'); setStatusMessage('Please provide a recipient email.'); return; }
    if (!jobDescription.trim()) { setStatus('error'); setStatusMessage('Please paste the job description.'); return; }
    if (!companyName.trim()) { setStatus('error'); setStatusMessage('Please enter the target company.'); return; }

    setStatus('loading')
    setStatusMessage('Gemini is tailoring your resume. Check your inbox in ~30 seconds!')
    setErrorDetail('')

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          baseResume: baseResume.trim(),
          recipientEmail: recipientEmail.trim(),
          companyName: companyName.trim(),
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `HTTP ${response.status}`)
      }

      setStatus('success')
      setStatusMessage(`Success! Your tailored resume was sent to ${recipientEmail}.`)
      setJobDescription(''); setCompanyName(''); setCharCount(0);
    } catch (err) {
      setStatus('error')
      const friendly = parseGeminiError(err.message)
      setStatusMessage(friendly || 'Submission failed. Check your n8n connection.')
      setErrorDetail(err.message)
    }
  }

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">🎯</div>
          <span className="logo-text">ResumeForge AI</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="btn-clear" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
          <div className="header-badge">
            <span className="badge-dot"></span>
            Gemini 2.0 Pro
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-eyebrow">✨ Professional Resume Tailoring</div>
          <h1>Tailor your resume <span className="gradient-text">in seconds</span></h1>
          <p>Paste the JD and your base resume. Gemini extracts the relevant impact and sends a clean, 1-page PDF to your inbox.</p>
        </section>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="split-layout">
              <div className="left-col">
                <div className="form-section">
                  <label htmlFor="job-description" className="form-label">
                    <span className="form-label-icon">📋</span> Job Description
                  </label>
                  <textarea
                    id="job-description"
                    className="form-textarea"
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={handleJDChange}
                    style={{ height: '220px' }}
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="base-resume" className="form-label">
                    <span className="form-label-icon">📄</span> My Base Resume
                  </label>
                  <textarea
                    id="base-resume"
                    className="form-textarea"
                    placeholder="Paste your source resume content here (the info Gemini will use)..."
                    value={baseResume}
                    onChange={(e) => setBaseResume(e.target.value)}
                    style={{ height: '300px' }}
                  />
                </div>
              </div>

              <div className="right-col">
                <div className="form-section">
                  <label htmlFor="company-name" className="form-label">
                    <span className="form-label-icon">🏢</span> Target Company
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Google, Atlassian..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="recipient-email" className="form-label">
                    <span className="form-label-icon">📨</span> Send PDF To
                  </label>
                  <input
                    id="recipient-email"
                    type="email"
                    className="form-input"
                    placeholder="yourname@gmail.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="api-info-note">
                  <span className="api-info-icon">⚡</span>
                  <span>ATS-Optimized &amp; High Precision</span>
                </div>

                <button id="generate-btn" type="submit" className="btn-primary" disabled={status === 'loading'}>
                  {status === 'loading' ? (<><span className="spinner"></span> Tailoring...</>) : '✨ Generate & Send'}
                  <span className="btn-shimmer"></span>
                </button>

                <div className="form-hint" style={{ marginTop: '16px', justifyContent: 'center' }}>
                  <span>🔒 Data is saved locally in your browser.</span>
                </div>
              </div>
            </div>
          </form>

          {status && (
            <div className={`status-card ${status}`} role="alert" style={{ marginTop: '32px' }}>
              <span className="status-icon">
                {status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}
              </span>
              <div style={{flex:1}}>
                <div className="status-title">
                  {status === 'success' ? 'Ready!' : status === 'error' ? 'Error' : 'Crafting...'}
                </div>
                <div className="status-message">{statusMessage}</div>
                {errorDetail && <code style={{ display: 'block', marginTop: '4px', fontSize: '10px' }}>{errorDetail}</code>}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        Built by <a href="https://ravindernegi.vercel.app" target="_blank">Ravinder Singh Negi</a> · Powered by n8n &amp; Gemini
      </footer>
    </div>
  )
}
