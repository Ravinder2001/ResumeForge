import { useState, useEffect } from 'react'
import './index.css'

const WEBHOOK_URL = 'https://new-n8n-latest.duckdns.org/webhook/generate-resume'

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
  // Main form state
  const [jobDescription, setJobDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  
  // Persistent configuration state
  const [resumeDriveLink, setResumeDriveLink] = useState(() => localStorage.getItem('resume_drive_link') || '')
  const [recipientEmail, setRecipientEmail] = useState(() => localStorage.getItem('recipient_email') || "")
  
  // UI/Status state
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [charCount, setCharCount] = useState(0)

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem('resume_drive_link', resumeDriveLink)
  }, [resumeDriveLink])

  useEffect(() => {
    localStorage.setItem('recipient_email', recipientEmail)
  }, [recipientEmail])

  const handleJDChange = (e) => {
    setJobDescription(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!resumeDriveLink.trim()) {
      setStatus('error')
      setStatusMessage('Please provide your Resume Drive Link in the settings above.')
      return
    }
    if (!recipientEmail.trim()) {
      setStatus('error')
      setStatusMessage('Please provide a recipient email address in the settings.')
      return
    }
    if (!jobDescription.trim()) {
      setStatus('error')
      setStatusMessage('Please paste the job description before generating.')
      return
    }
    if (!companyName.trim()) {
      setStatus('error')
      setStatusMessage('Please enter the company name you are applying to.')
      return
    }

    setStatus('loading')
    setStatusMessage('Sending to n8n… Gemini is crafting your tailored resume. This may take 15–30 seconds.')
    setErrorDetail('')

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          baseResume: resumeDriveLink.trim(),
          recipientEmail: recipientEmail.trim(),
          companyName: companyName.trim(),
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || `HTTP ${response.status}`)
      }

      setStatus('success')
      setStatusMessage(
        `Your tailored resume has been generated and sent to ${recipientEmail}. Check your inbox!`
      )
      setErrorDetail('')
      setJobDescription('')
      setCompanyName('')
      setCharCount(0)
    } catch (err) {
      setStatus('error')
      const friendly = parseGeminiError(err.message)
      if (friendly) {
        setStatusMessage(friendly)
      } else {
        setStatusMessage('Something went wrong while generating your resume.')
        setErrorDetail(err.message)
      }
    }
  }

  const steps = [
    {
      title: 'Configure Your Profile',
      desc: 'Provide your base resume link and recipient email once. They stay saved locally!',
    },
    {
      title: 'Paste the Job Description',
      desc: 'Copy the full JD from any job board — LinkedIn, Naukri, Indeed, etc.',
    },
    {
      title: 'Hit "Generate & Send"',
      desc: 'The workflow calls Google Gemini with your base resume link + the JD.',
    },
    {
      title: 'Gemini Tailors Your Resume',
      desc: 'Only relevant skills & experiences are highlighted. ATS keywords are matched.',
    },
    {
      title: 'Resume lands in your inbox',
      desc: 'A clean, ATS-friendly PDF version is emailed directly to you.',
    },
  ]

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">🎯</div>
          <span className="logo-text">ResumeForge AI</span>
        </div>
        <div className="header-badge">
          <span className="badge-dot"></span>
          Powered by Google Gemini
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            ✨ AI-Powered Resume Customization
          </div>
          <h1>
            Tailor your resume for{' '}
            <span className="gradient-text">every job, instantly</span>
          </h1>
          <p>
            Paste any job description and get a custom, ATS-optimized resume delivered to
            your inbox — no fluff, no irrelevant skills, just what the recruiter wants to see.
          </p>
        </section>

        {/* Info Cards */}
        <div className="info-row">
          <div className="info-card">
            <div className="info-card-icon">🔍</div>
            <div className="info-card-title">ATS Optimized</div>
            <div className="info-card-desc">Keywords matched directly from the JD</div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">⚡</div>
            <div className="info-card-title">~30 seconds</div>
            <div className="info-card-desc">From paste to inbox delivery</div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">📧</div>
            <div className="info-card-title">Email Delivery</div>
            <div className="info-card-desc">Sent straight to your inbox via n8n</div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="split-layout">
              {/* Left Column: Job Description */}
              <div className="left-col">
                <div className="form-section">
                  <label htmlFor="job-description" className="form-label">
                    <span className="form-label-icon">📋</span>
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    className="form-textarea"
                    placeholder="Paste the full job description here…&#10;&#10;We're looking for a Senior React Developer with 3+ years of experience in..."
                    value={jobDescription}
                    onChange={handleJDChange}
                    spellCheck={false}
                  />
                  <div className="form-hint">
                    <span>💡</span>
                    <span>Include the full JD — role, responsibilities, and requirements. {charCount > 0 && `(${charCount.toLocaleString()} chars)`}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Settings and Action */}
              <div className="right-col">
                {/* Configuration / Settings */}
                <div className="form-section">
                  <label htmlFor="resume-link" className="form-label">
                    <span className="form-label-icon">🔗</span>
                    Base Resume Link
                  </label>
                  <input
                    id="resume-link"
                    type="url"
                    className="form-input"
                    placeholder="Paste your Google Drive PDF link…"
                    value={resumeDriveLink}
                    onChange={(e) => setResumeDriveLink(e.target.value)}
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="recipient-email" className="form-label">
                    <span className="form-label-icon">📨</span>
                    Default Recipient Email
                  </label>
                  <input
                    id="recipient-email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. yourname@gmail.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="company-name" className="form-label">
                    <span className="form-label-icon">🏢</span>
                    Target Company
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Google, Atlassian…"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                {/* API info note */}
                <div className="api-info-note">
                  <span className="api-info-icon">🔗</span>
                  <span>
                    Powered by Google Gemini via n8n
                  </span>
                </div>

                {/* Submit */}
                <button
                  id="generate-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <span className="spinner"></span>
                      Generating…
                    </>
                  ) : (
                    <>
                      ✨ Generate &amp; Send
                    </>
                  )}
                  <span className="btn-shimmer"></span>
                </button>

                <div className="form-hint" style={{ marginTop: '16px', justifyContent: 'center' }}>
                  <span>⚙️</span>
                  <span>Settings are saved locally.</span>
                </div>
              </div>
            </div>
          </form>

          {/* Status Message */}
          {status && (
            <div className={`status-card ${status}`} role="alert">
              <span className="status-icon">
                {status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}
              </span>
              <div style={{flex:1}}>
                <div className="status-title">
                  {status === 'success' ? 'Resume sent!' : status === 'error' ? 'Error' : 'Processing…'}
                </div>
                <div className="status-message">{statusMessage}</div>
                {errorDetail && (
                  <details className="error-detail">
                    <summary>Technical details</summary>
                    <code>{errorDetail}</code>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <section className="steps-section">
          <div className="steps-header">How it works</div>
          <div className="steps-list">
            {steps.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        Built by{' '}
        <a href="https://ravindernegi.vercel.app" target="_blank" rel="noopener noreferrer">
          Ravinder Singh Negi
        </a>{' '}
        · Powered by{' '}
        <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">
          Google Gemini
        </a>{' '}
        &{' '}
        <a href="https://n8n.io" target="_blank" rel="noopener noreferrer">
          n8n
        </a>
      </footer>
    </div>
  )
}
