import { useState } from 'react'
import './index.css'

const BASE_RESUME = `RAVINDER SINGH NEGI
New Delhi, India | +91-9756726341 | rvnegi786@gmail.com
linkedin.com/in/ravinder-singh-negi | ravindernegi.vercel.app | github.com/Ravinder2001

PROFESSIONAL SUMMARY
Full Stack Developer with 4+ years of experience building scalable, high-performance web applications using React.js, Next.js, Node.js, and PostgreSQL. Specialized in building scalable web applications, reusable UI component systems, and robust REST APIs. Delivered enterprise-grade platforms for pharmaceutical clients serving thousands of users. Experienced in AI integrations, workflow automation, and modern cloud deployments. Two-time WOW Award recipient at Indus Net Technologies.

TECHNICAL SKILLS
Frontend: React.js, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, Responsive UI, Component Architecture, Performance Optimization
Backend: Node.js, Express.js, REST API Development, MySQL, PostgreSQL, MongoDB, API Integration, Scalable Backend Systems
AI & Automation: LLM Integration, RAG Pipelines, n8n Workflows, Google Gemini, AI Automation
Tools & Cloud: Git, GitHub, AWS, Vercel, CI/CD, npm, Agile Development

PROFESSIONAL EXPERIENCE
Software Engineer | Mar 2022 – Present
Indus Net Technologies (INT.), Kolkata
• Architected and delivered 30+ full-stack production features using React.js, Next.js and Node.js for enterprise pharmaceutical platforms used by 1000+ internal users.
• Developed 50+ reusable UI components improving frontend development speed by 40% and ensuring consistent responsive design across multiple products.
• Built and optimized REST APIs and PostgreSQL queries improving system response time by 35% and reducing backend processing overhead.
• Led frontend implementation of complex dashboards and workflow systems handling large datasets and business-critical operations.
• Improved code quality through structured code reviews, refactoring initiatives and modern architecture patterns across the team.
• Promoted from Associate Software Engineer to Software Engineer within 2 years for consistent high performance and technical contributions.

PROJECTS
AI Meeting Assistant — LLM, NLP, n8n | github.com/Ravinder2001/AI-Meeting-Validator
Developed an LLM-based meeting validation system that compares transcripts against formal documentation, improving compliance verification and semantic accuracy.

Hisabkar — Expense Splitter PWA — React.js, TypeScript, Node.js, PostgreSQL, AWS | hisabkar.vercel.app
Designed and deployed a scalable Progressive Web App for personal finance management with real-time transaction handling and cloud deployment on AWS.

Automated Incident Responder — n8n, Google Gemini, RAG | github.com/Ravinder2001/Incident-Responder-System
Built AI-powered server monitoring automation using n8n workflows and RAG-based error interpretation, reducing manual incident triage effort by 70%.

Create Pro App — CLI Tool — Node.js, Open Source | npmjs.com/package/create-pro-app
Built and published an open source Node.js CLI to bootstrap modern React projects with optimized tooling and project structure.

AWARDS
WOW Award (2×) — Indus Net Technologies | Feb 2024 & Jun 2024
Recognised twice within the same year for outstanding performance and significant technical contributions to key enterprise projects.

EDUCATION
Sikkim Manipal University | Mar 2024 – Mar 2026
Master of Computer Applications (MCA) — Computer Science

Masai School | Apr 2021 – Jan 2022
Full Stack Web Development Program`

const WEBHOOK_URL = 'https://new-n8n-latest.duckdns.org/webhook/generate-resume'
const DEFAULT_EMAIL = 'rvnegi786@gmail.com'

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
  const [recipientEmail, setRecipientEmail] = useState(DEFAULT_EMAIL)
  const [companyName, setCompanyName] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [charCount, setCharCount] = useState(0)

  const handleJDChange = (e) => {
    setJobDescription(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!jobDescription.trim()) {
      setStatus('error')
      setStatusMessage('Please paste the job description before generating your resume.')
      setErrorDetail('')
      return
    }
    if (!recipientEmail.trim()) {
      setStatus('error')
      setStatusMessage('Please provide a recipient email address.')
      setErrorDetail('')
      return
    }
    if (!companyName.trim()) {
      setStatus('error')
      setStatusMessage('Please enter the company name you are applying to.')
      setErrorDetail('')
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
          baseResume: BASE_RESUME,
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
        `Your tailored resume has been generated and sent to ${recipientEmail}. Check your inbox (and spam folder) in a moment!`
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
        setErrorDetail('')
      } else {
        setStatusMessage('Something went wrong while generating your resume.')
        setErrorDetail(err.message)
      }
    }
  }

  const steps = [
    {
      title: 'Paste the Job Description',
      desc: 'Copy the full JD from any job board — LinkedIn, Naukri, Indeed, etc.',
    },
    {
      title: 'Hit "Generate & Send"',
      desc: 'The workflow calls Google Gemini with your base resume + the JD.',
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
            {/* JD Textarea */}
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
                <span>Include the full JD — role, responsibilities, and requirements for best results. {charCount > 0 && `(${charCount.toLocaleString()} chars)`}</span>
              </div>
            </div>

            {/* Company + Email row */}
            <div className="two-col-grid">
              <div>
                <label htmlFor="company-name" className="form-label">
                  <span className="form-label-icon">🏢</span>
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Google, Atlassian, Razorpay…"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="recipient-email" className="form-label">
                  <span className="form-label-icon">📨</span>
                  Send Resume To
                </label>
                <input
                  id="recipient-email"
                  type="email"
                  className="form-input"
                  placeholder="rvnegi786@gmail.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>

            {/* API info note */}
            <div className="api-info-note">
              <span className="api-info-icon">🔗</span>
              <span>
                Requests are sent to{' '}
                <code className="api-endpoint">POST /webhook/generate-resume</code>
                {' '}· Powered by Google Gemini 2.0 Flash via n8n
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
                  Generating your resume…
                </>
              ) : (
                <>
                  ✨ Generate &amp; Send Resume
                </>
              )}
              <span className="btn-shimmer"></span>
            </button>
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
