import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, BarChart3, Bot, ChevronRight, ClipboardCheck, Download, FileText, Filter,
  HelpCircle, Home, Languages, Leaf, LogOut, Menu, Package, Plus, ScanSearch,
  Settings, ShieldCheck, Star, TrendingUp, Upload, UserCircle, X, Zap, AlertTriangle,
  CheckCircle, Bell, Search, Calendar, Eye, RefreshCw, Send, Trash2, CheckCheck, QrCode,
  CheckSquare, Square, DollarSign, HeartPulse, Sparkles, MessageSquare, Headphones
} from 'lucide-react'
import { mockBatches, mockReports, mockTests, resultParameters, trendData } from './mockData'

const riskClass = risk => (risk === 'Good' || risk === 'Low Risk') ? 'good' : (risk === 'Caution' || risk === 'Moderate Risk' || risk === 'Warning') ? 'caution' : 'high'

/* ── Global App Context (language, settings, toast, auth) ── */
const AppCtx = createContext({})
function useApp() { return useContext(AppCtx) }

const LANGS = {
  English: {
    dashboard:'Dashboard', newAnalysis:'New Analysis', myBatches:'My Batches',
    silageCoach:'Silage Coach', history:'History', analytics:'Analytics', reports:'Reports',
    aiAssistant:'AI Assistant', profile:'Profile', settings:'Settings',
    welcomeBack:'Welcome back, Farmer Raj 👋',
    totalAnalyses:'Total Analyses', goodQuality:'Good Quality', caution:'Caution', highRisk:'High Risk',
    averageScore:'Average Score', qualityTrend:'Quality Trend (All Batches)',
    riskDistribution:'Risk Distribution', recentAnalyses:'Recent Analyses',
    sampleId:'Sample ID', batchId:'Batch ID', type:'Type', analyzedOn:'Analyzed On',
    score:'Score', risk:'Risk', action:'Action', viewReport:'View Report',
    addNewBatch:'Add New Batch', exportCsv:'Export CSV',
    needHelp:'Need Help?', contactSupport:'Contact Support',
    sampleReports:'Sample Reports', batchReports:'Batch Reports',
    generateReport:'Generate New Report', clearChat:'Clear Chat',
    typeQuestion:'Type your question...',
    screeningEst:'Screening estimate — not a laboratory measurement.',
  },
  हिंदी: {
    dashboard:'डैशबोर्ड', newAnalysis:'नया विश्लेषण', myBatches:'मेरे बैच',
    silageCoach:'साइलेज कोच', history:'इतिहास', analytics:'विश्लेषिकी', reports:'रिपोर्ट',
    aiAssistant:'AI सहायक', profile:'प्रोफ़ाइल', settings:'सेटिंग्स',
    welcomeBack:'स्वागत है, किसान राज 👋',
    totalAnalyses:'कुल विश्लेषण', goodQuality:'अच्छी गुणवत्ता', caution:'सावधानी', highRisk:'उच्च जोखिम',
    averageScore:'औसत स्कोर', qualityTrend:'गुणवत्ता प्रवृत्ति (सभी बैच)',
    riskDistribution:'जोखिम वितरण', recentAnalyses:'हाल के विश्लेषण',
    sampleId:'नमूना ID', batchId:'बैच ID', type:'प्रकार', analyzedOn:'विश्लेषण दिनांक',
    score:'स्कोर', risk:'जोखिम', action:'कार्रवाई', viewReport:'रिपोर्ट देखें',
    addNewBatch:'नया बैच जोड़ें', exportCsv:'CSV निर्यात करें',
    needHelp:'सहायता चाहिए?', contactSupport:'सपोर्ट से संपर्क करें',
    sampleReports:'नमूना रिपोर्ट', batchReports:'बैच रिपोर्ट',
    generateReport:'नई रिपोर्ट बनाएं', clearChat:'चैट साफ़ करें',
    typeQuestion:'अपना प्रश्न यहाँ लिखें...',
    screeningEst:'स्क्रीनिंग अनुमान — प्रयोगशाला परीक्षण नहीं।',
  }
}

const API_BASE = 'http://localhost:8000'

function App() {
  const [lang, setLang] = useState('English')
  const [settings, setSettings] = useState({ notifications: true, offline: true, darkMode: false })
  const [toasts, setToasts] = useState([])
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartfeed_user')
    return saved ? JSON.parse(saved) : { _id: '664f1a2b3c4d5e6f7a8b9c01', name: 'Farmer Raj', email: 'raj@farm.com', phone: '+91 98765 43210', location: 'Anand, Gujarat' }
  })
  const [token, setToken] = useState(() => localStorage.getItem('smartfeed_token') || 'guest-token-mock')

  const t = LANGS[lang] || LANGS.English

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('smartfeed_user', JSON.stringify(userData))
    localStorage.setItem('smartfeed_token', userToken)
    toast('Logged in successfully', 'success')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('smartfeed_user')
    localStorage.removeItem('smartfeed_token')
  }

  const apiFetch = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP error! Status: ${res.status}`)
    }
    return res.json()
  }

  const toast = (msg, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), duration)
  }

  const setSetting = (key, val) => {
    setSettings(s => ({ ...s, [key]: val }))
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', val)
    }
  }

  const switchLang = (l) => {
    setLang(l)
  }

  return (
    <AppCtx.Provider value={{ lang, t, settings, setSetting, switchLang, toast, user, token, login, logout, apiFetch }}>
      <div className={settings.darkMode ? 'dark-root' : ''}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/*" element={<Shell />} />
          </Routes>
        </BrowserRouter>
        {toasts.length > 0 && (
          <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toasts.map(t => (
              <div key={t.id} style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <CheckCircle size={14} color="#22c55e" />
                <span>{t.msg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppCtx.Provider>
  )
}

/* ─────────────────── SCREEN 1: HOMEPAGE (LANDING PAGE) ─────────────────── */
function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Navigation */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-logo-icon"><Leaf size={18}/></div>
          <b style={{ fontSize: 16, color: 'var(--ink-900)', fontFamily: 'var(--font-heading)' }}>SmartFeed AI</b>
        </div>
        <nav className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary sm" onClick={() => navigate('/login')}>Login</button>
          <button className="button primary sm" onClick={() => navigate('/analysis/new')}>Get Started</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero" id="home">
        <div>
          <div className="hero-badge-pill">
            <Sparkles size={13}/> AI-Powered Feed & Silage Intelligence
          </div>
          <h1 className="hero-title">Smarter Feed Decisions.<br/>Healthier Herds.</h1>
          <p className="hero-desc">
            AI-powered rapid screening of feed and silage quality using computer vision.
          </p>
          <ul className="hero-check-list">
            <li><CheckCircle size={15} color="#16a34a"/> Detect risks early</li>
            <li><CheckCircle size={15} color="#16a34a"/> Improve productivity</li>
            <li><CheckCircle size={15} color="#16a34a"/> Ensure better health</li>
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="button primary lg" onClick={() => navigate('/analysis/new')}>
              Analyze a Sample <ScanSearch size={16}/>
            </button>
            <button className="button secondary lg" onClick={() => navigate('/dashboard')}>
              Explore Platform
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="social-proof-avatars">
              <span>🌾</span><span>🐄</span><span>👨‍🌾</span>
            </div>
            <div>
              <b style={{ fontSize: 12, display: 'block', color: 'var(--ink-900)' }}>Trusted by 500+ Farmers & Dairy Professionals</b>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#eab308" color="#eab308"/>)}
                <small style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-700)', marginLeft: 4 }}>4.8/5 Google Rating</small>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Preview Card Over Photo */}
        <div className="hero-preview-card">
          <img src="/silage_sample.jpg" alt="Silage Screening" className="hero-preview-img" onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
          <div className="hero-floating-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>✦ Smart Analysis Preview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <b style={{ fontSize: 24, fontFamily: 'var(--font-heading)', color: '#16a34a' }}>87 / 100</b>
                <span className="badge good" style={{ display: 'block', width: 'fit-content', marginTop: 2 }}>Good Quality</span>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                <CheckCircle size={22}/>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-700)', display: 'grid', gap: 4, padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>Screening Risk</span><b style={{ color: '#16a34a' }}>Low Risk</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>Sample Type</span><b>Silage</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>Analyzed On</span><span style={{ fontSize: 10 }}>22 May 2025, 10:30 AM</span>
              </div>
            </div>
            <button className="button primary sm full" style={{ marginTop: 8 }} onClick={() => navigate('/dashboard')}>
              View Full Analysis →
            </button>
          </div>
        </div>
      </section>

      {/* Feature Ribbon (Screen 1 bottom) */}
      <section className="landing-ribbon" id="features">
        <div className="ribbon-grid">
          <div className="ribbon-item">
            <div className="ribbon-icon"><ScanSearch size={20}/></div>
            <b>AI Analysis</b>
            <small>Accurate computer vision screening</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><AlertTriangle size={20}/></div>
            <b>Spoilage Detection</b>
            <small>Identify potential quality risks</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><TrendingUp size={20}/></div>
            <b>Batch Intelligence</b>
            <small>Track quality trends over time</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><Bot size={20}/></div>
            <b>Explainable AI</b>
            <small>Understand what AI sees</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><FileText size={20}/></div>
            <b>Smart Reports</b>
            <small>Download & share detailed reports</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><Leaf size={20}/></div>
            <b>Farmer Friendly</b>
            <small>Simple, fast and easy to use</small>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────── APP SHELL (SIDEBAR & TOPBAR) ─────────────────── */
function Shell() {
  const navigate = useNavigate()
  const { t, lang, switchLang, user, logout } = useApp()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const navItems = [
    ['/dashboard', t.dashboard, BarChart3],
    ['/analysis/new', t.newAnalysis, ScanSearch],
    ['/batches', t.myBatches, Package],
    ['/coach', t.silageCoach, ClipboardCheck],
    ['/history', t.history, Activity],
    ['/analytics', t.analytics, TrendingUp],
    ['/reports', t.reports, FileText],
    ['/assistant', t.aiAssistant, Bot],
    ['/profile', t.profile, UserCircle],
    ['/settings', t.settings, Settings],
  ]

  return (
    <div className="app-shell">
      {/* Sidebar - Matching Mockup 100% */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-icon"><Leaf size={17}/></div>
          <div className="brand-text-wrap">
            <b>SmartFeed AI</b>
            <small>Feed Screening</small>
          </div>
        </div>

        <nav className="sidebar-nav-list">
          {navItems.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={16}/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Support box from Mockup */}
        <div className="sidebar-support-card" onClick={() => navigate('/assistant')}>
          <Headphones size={18} color="#88be99"/>
          <div>
            <b>{t.needHelp}</b>
            <small>{t.contactSupport}</small>
          </div>
        </div>

        {/* Language switch */}
        <div className="sidebar-lang-toggle">
          <span>Language</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`lang-chip-btn ${lang === 'English' ? 'active' : ''}`} onClick={() => switchLang('English')}>EN</button>
            <button className={`lang-chip-btn ${lang === 'हिंदी' ? 'active' : ''}`} onClick={() => switchLang('हिंदी')}>हिंदी</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <h2>SmartFeed AI</h2>
          </div>

          <div className="topbar-right">
            <div className="topbar-date-badge">
              <Calendar size={13} color="var(--brand-primary)"/>
              <span>15 May 2025 – 22 May 2025</span>
            </div>

            <button className="topbar-icon-btn">
              <Bell size={16}/>
              <span className="topbar-notif-dot"/>
            </button>

            <div className="topbar-user-pill" onClick={() => navigate('/profile')}>
              <div className="topbar-avatar">{user?.name ? user.name[0].toUpperCase() : 'R'}</div>
              <div className="topbar-user-details">
                <b>{user?.name || 'Farmer Raj'}</b>
                <small>{user?.email || 'raj@farm.com'}</small>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/analysis/new" element={<NewAnalysis/>}/>
          <Route path="/analysis/:id" element={<Result/>}/>
          <Route path="/batches" element={<Batches/>}/>
          <Route path="/batches/:id" element={<BatchDetail/>}/>
          <Route path="/coach" element={<SilageCoach/>}/>
          <Route path="/history" element={<History/>}/>
          <Route path="/analytics" element={<Analytics/>}/>
          <Route path="/assistant" element={<Assistant/>}/>
          <Route path="/reports" element={<Reports/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 4: DASHBOARD PAGE ─────────────────── */
function Dashboard() {
  const navigate = useNavigate()
  const { t, apiFetch, user } = useApp()
  const [tests, setTests] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    apiFetch('/api/tests').then(setTests).catch(console.error)
    apiFetch('/api/analytics').then(setAnalytics).catch(console.error)
  }, [apiFetch])

  const total = analytics?.totalTests || (tests.length > 0 ? tests.length : 128)
  const good = analytics?.riskDistribution?.Good ?? 82
  const caution = analytics?.riskDistribution?.Warning ?? 31
  const high = analytics?.riskDistribution?.Bad ?? 15
  const avgScore = analytics?.averageScore ?? 81

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name || 'Farmer Raj'} 👋</p>
        </div>
        <button className="button primary" onClick={() => navigate('/analysis/new')}>
          <Plus size={15}/> New Analysis
        </button>
      </div>

      {/* 5 Top Stat Metric Cards (Matching Screen 4) */}
      <div className="dashboard-stat-grid">
        <div className="stat-metric-card">
          <small>Total Analyses</small>
          <div className="stat-metric-value-row">
            <b>{total}</b>
            <span className="stat-metric-delta good">↑ 12% from last week</span>
          </div>
        </div>
        <div className="stat-metric-card">
          <small>Good Quality</small>
          <div className="stat-metric-value-row">
            <b>{good}</b>
            <span className="stat-metric-delta good">{Math.round((good/total)*100)}% of total</span>
          </div>
        </div>
        <div className="stat-metric-card">
          <small>Caution</small>
          <div className="stat-metric-value-row">
            <b>{caution}</b>
            <span className="stat-metric-delta caution">{Math.round((caution/total)*100)}% of total</span>
          </div>
        </div>
        <div className="stat-metric-card">
          <small>High Risk</small>
          <div className="stat-metric-value-row">
            <b>{high}</b>
            <span className="stat-metric-delta high">{Math.round((high/total)*100)}% of total</span>
          </div>
        </div>
        <div className="stat-metric-card">
          <small>Average Score</small>
          <div className="stat-metric-value-row">
            <b>{avgScore}/100</b>
            <span className="stat-metric-delta good">↑ 6 points</span>
          </div>
        </div>
      </div>

      {/* Charts Grid: Quality Trend (Left) & Risk Distribution (Right) */}
      <div className="dashboard-charts-grid">
        <div className="card chart-card-wrap">
          <div className="card-head">
            <b>Quality Trend (All Batches)</b>
            <select className="field-input" style={{ height: 32, fontSize: 11, padding: '0 8px' }}>
              <option>All Batches</option>
              <option>SILAGE-001</option>
            </select>
          </div>
          <div className="trend-svg-wrap">
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1"/>
              
              <text x="15" y="25" fill="#94a3b8" fontSize="10">100</text>
              <text x="15" y="65" fill="#94a3b8" fontSize="10">75</text>
              <text x="15" y="105" fill="#94a3b8" fontSize="10">50</text>
              <text x="15" y="145" fill="#94a3b8" fontSize="10">25</text>

              {/* Smooth trend curve */}
              <polyline
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                points="60,35 125,48 190,58 255,65 320,72 385,82 450,92"
              />
              {[[60,35],[125,48],[190,58],[255,65],[320,72],[385,82],[450,92]].map(([cx,cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
              ))}
              
              {['15 May','16 May','17 May','18 May','20 May','21 May','22 May'].map((d, i) => (
                <text key={i} x={60 + i*65} y="158" fill="#64748b" fontSize="10" textAnchor="middle">{d}</text>
              ))}
            </svg>
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="card donut-chart-container">
          <div className="card-head" style={{ width: '100%', marginBottom: 8 }}>
            <b>Risk Distribution</b>
          </div>
          <div className="donut-circle-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#fee2e2" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="0"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#fef3c7" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="28"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray="238.7" strokeDashoffset="85"/>
            </svg>
            <div className="donut-center-label">
              <b>{total}</b>
              <small>Total</small>
            </div>
          </div>
          <div className="donut-legend-stack">
            <div className="donut-legend-row">
              <span><span className="donut-legend-dot" style={{ background: '#16a34a' }}/>Good ({Math.round((good/total)*100)}%)</span>
              <b>{good}</b>
            </div>
            <div className="donut-legend-row">
              <span><span className="donut-legend-dot" style={{ background: '#f59e0b' }}/>Caution ({Math.round((caution/total)*100)}%)</span>
              <b>{caution}</b>
            </div>
            <div className="donut-legend-row">
              <span><span className="donut-legend-dot" style={{ background: '#ef4444' }}/>High Risk ({Math.round((high/total)*100)}%)</span>
              <b>{high}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14 }}>Recent Analyses</b>
          <Link to="/history" style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 700 }}>View All →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Batch ID</th>
              <th>Type</th>
              <th>Analyzed On</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(tests.length > 0 ? tests : mockTests).slice(0, 5).map(t2 => {
              const risk = t2.overallStatus || t2.risk || 'Good'
              const id = t2.id || t2._id
              return (
                <tr key={id}>
                  <td><b>{id}</b></td>
                  <td>{t2.batchId || 'SILAGE-001'}</td>
                  <td>{t2.sampleType || t2.type || 'Silage'}</td>
                  <td>{t2.analyzedOn || '22 May 2025, 10:30 AM'}</td>
                  <td><b>{t2.score || 87}</b></td>
                  <td><span className={`badge ${riskClass(risk)}`}>{risk}</span></td>
                  <td>
                    <Link to={`/analysis/${id}`} className="button secondary sm"><Eye size={12}/> View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 2: NEW ANALYSIS (UPLOAD PAGE) ─────────────────── */
const getBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
})

function NewAnalysis() {
  const navigate = useNavigate()
  const { toast, apiFetch } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sampleType, setSampleType] = useState('Silage')
  const [feedType, setFeedType] = useState('Maize Silage')
  const [storageDuration, setStorageDuration] = useState('20')
  const [storageCondition, setStorageCondition] = useState('Covered')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = f => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!file) return toast('Please select a feed/silage image first', 'error')

    setLoading(true)
    try {
      const base64 = await getBase64(file)
      const data = await apiFetch('/api/tests', {
        method: 'POST',
        body: JSON.stringify({
          image: base64,
          imageName: file.name,
          sampleType,
          feedType,
          storageDuration: Number(storageDuration) || 0,
          storageCondition,
          notes,
          batchId: 'SILAGE-001'
        })
      })
      toast('Screening analysis complete with Gemini AI!', 'success')
      navigate(`/analysis/${data.id || data._id}`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>New Analysis</h1>
          <p>Upload a feed or silage sample image for AI analysis</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze}>
        <div className="analysis-split-grid">
          {/* Left: Upload Image Box (Matching Screen 2) */}
          <div className="card">
            <b style={{ display: 'block', fontSize: 13, marginBottom: 14 }}>Upload Image</b>
            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={preview} alt="Upload Preview" style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 8 }}/>
                  <button type="button" className="button secondary sm" style={{ marginTop: 12 }} onClick={(e)=>{e.stopPropagation();setFile(null);setPreview(null)}}>
                    Remove Photo
                  </button>
                </div>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e=>handleFileSelect(e.target.files[0])}/>
                  <div className="upload-cloud-icon"><Upload size={24}/></div>
                  <b style={{ fontSize: 14, color: 'var(--ink-900)', marginBottom: 4 }}>Drag & drop image here</b>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>or</span>
                  <span className="button secondary sm" style={{ pointerEvents: 'none' }}>Browse Files</span>
                  <small style={{ color: 'var(--ink-400)', fontSize: 10, marginTop: 16 }}>Supports: JPG, PNG, JPEG (Max 10MB)</small>
                </>
              )}
            </div>
          </div>

          {/* Right: Sample Information Form (Matching Screen 2) */}
          <div className="card">
            <b style={{ display: 'block', fontSize: 13, marginBottom: 14 }}>Sample Information</b>
            <div className="form-field-group">
              <label className="field-label">Sample Type *
                <select className="field-input" value={sampleType} onChange={e=>setSampleType(e.target.value)}>
                  <option value="Silage">Silage</option>
                  <option value="Feed">Feed</option>
                </select>
              </label>
              <label className="field-label">Feed Type
                <select className="field-input" value={feedType} onChange={e=>setFeedType(e.target.value)}>
                  <option value="Maize Silage">Maize Silage</option>
                  <option value="Grass Silage">Grass Silage</option>
                  <option value="Cattle Feed">Cattle Feed</option>
                  <option value="Dairy Concentrate">Dairy Concentrate</option>
                </select>
              </label>
            </div>

            <div className="form-field-group">
              <label className="field-label">Storage Duration (Days)
                <input type="number" className="field-input" value={storageDuration} onChange={e=>setStorageDuration(e.target.value)}/>
              </label>
              <label className="field-label">Storage Condition
                <select className="field-input" value={storageCondition} onChange={e=>setStorageCondition(e.target.value)}>
                  <option value="Covered">Covered</option>
                  <option value="Silo">Silo</option>
                  <option value="Open">Open</option>
                </select>
              </label>
            </div>

            <label className="field-label" style={{ marginBottom: 20 }}>Notes (Optional)
              <textarea className="field-input" rows={3} placeholder="Any additional information..." value={notes} onChange={e=>setNotes(e.target.value)}/>
            </label>

            <button type="submit" className="button primary full lg" disabled={loading}>
              {loading ? <><RefreshCw size={16} className="spin"/> Analyzing Sample with Gemini...</> : 'Analyze Sample'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

/* ─────────────────── SCREEN 3: ANALYSIS RESULT PAGE ─────────────────── */
function Result() {
  const { id } = useParams()
  const { apiFetch } = useApp()
  const [test, setTest] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/tests/${id}/detail`)
        setTest(data)
        const qrData = await apiFetch(`/api/qr/${id}`).catch(() => null)
        if (qrData) setQr(qrData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, apiFetch])

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}><RefreshCw size={32} className="spin" color="#16a34a"/></div>
  if (!test) return <div className="page"><h3>Sample Analysis Not Found</h3></div>

  const score = test.score ?? 87
  const risk = test.overallStatus || test.risk || 'Good Quality'

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Analysis Result</h1>
          <p>Sample ID: <b style={{ color: 'var(--ink-900)' }}>{test.id || test._id}</b></p>
        </div>
        <button className="button secondary" onClick={() => window.print()}>
          <Download size={14}/> Download Report
        </button>
      </div>

      <div className="result-top-grid">
        {/* Left Column: Radial Score Card & Metadata (Matching Screen 3) */}
        <div className="card score-display-card">
          <div className="score-radial-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8" strokeDasharray="264" strokeDashoffset={`${264 - (264 * score)/100}`} strokeLinecap="round"/>
            </svg>
            <div className="score-radial-inner">
              <b style={{ color: '#16a34a' }}>{score}</b>
              <small style={{ fontSize: 11, color: 'var(--ink-500)' }}>/100</small>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <span className="badge good" style={{ marginBottom: 12 }}>{risk}</span>
            <table className="score-details-table">
              <tbody>
                <tr><td>Screening Risk</td><td style={{ color: '#16a34a' }}>Low Risk</td></tr>
                <tr><td>Sample Type</td><td>{test.sampleType || 'Silage'}</td></tr>
                <tr><td>Analyzed On</td><td>22 May 2025, 10:30 AM</td></tr>
                <tr><td>Model Confidence</td><td>{test.confidence || 92}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Uploaded Image (Matching Screen 3) */}
        <div className="card" style={{ padding: 12 }}>
          <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>Uploaded Image</b>
          <img src={test.image || "/silage_sample.jpg"} alt="Silage Sample" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
        </div>
      </div>

      {/* Second Row: Key Indicators & Heatmap Overlay (Matching Screen 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 14 }}>Key Indicators</b>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}><CheckCircle size={15} color="#16a34a"/> Normal color and texture detected</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}><CheckCircle size={15} color="#16a34a"/> No significant mold detected</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}><CheckCircle size={15} color="#16a34a"/> Good storage parameters</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}><CheckCircle size={15} color="#16a34a"/> No visible spoilage signs</li>
          </ul>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>Quality Score Range</b>
            <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> Good (80-100)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 4 }}/> Caution (50-79)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> High Risk (0-49)</span>
            </div>
          </div>
        </div>

        {/* AI Heatmap Simulation Box */}
        <div className="card" style={{ padding: 12 }}>
          <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>AI Explanation (Heatmap)</b>
          <div style={{ position: 'relative', width: '100%', height: 170, borderRadius: 8, overflow: 'hidden', background: '#000' }}>
            <img src={test.image || "/silage_sample.jpg"} alt="Silage Sample Heatmap" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <circle cx="50" cy="45" r="28" fill="rgba(22, 163, 74, 0.45)" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 2"/>
              <circle cx="75" cy="30" r="14" fill="rgba(239, 68, 68, 0.55)" stroke="#ef4444" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 10, marginTop: 8, color: 'var(--ink-500)' }}>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> High Impact</span>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> Low Impact</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 5: MY BATCHES PAGE ─────────────────── */
function Batches() {
  const navigate = useNavigate()
  const { apiFetch, toast } = useApp()
  const [batches, setBatches] = useState([])
  const [modal, setModal] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [batchType, setBatchType] = useState('Silage')

  const load = async () => {
    try {
      const data = await apiFetch('/api/batches')
      if (Array.isArray(data)) setBatches(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [apiFetch])

  const create = async () => {
    if (!batchName.trim()) return
    try {
      await apiFetch('/api/batches', {
        method: 'POST',
        body: JSON.stringify({ type: batchType, feedType: batchType === 'Silage' ? 'Maize Silage' : 'Cattle Feed' })
      })
      setModal(false)
      load()
      toast('Batch created', 'success')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const list = batches.length > 0 ? batches : mockBatches

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>My Batches</h1>
          <p>Manage and track your batches</p>
        </div>
        <button className="button primary" onClick={() => setModal(true)}>
          <Plus size={14}/> Add New Batch
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Type</th>
              <th>Feed Type</th>
              <th>Created On</th>
              <th>Analyses</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => (
              <tr key={b.id}>
                <td><b>{b.id}</b></td>
                <td>{b.type}</td>
                <td>{b.feedType}</td>
                <td>{b.createdOn || '20 May 2025'}</td>
                <td>{b.analysesCount || b.analyses || 5}</td>
                <td><span className="badge good">Active</span></td>
                <td>
                  <button className="button secondary sm" onClick={() => navigate(`/batches/${b.id}`)}>
                    <Eye size={12}/> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
          <span>Showing 1 to {list.length} of {list.length} batches</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="button secondary sm" disabled>&lt;</button>
            <button className="button primary sm">1</button>
            <button className="button secondary sm" disabled>&gt;</button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Batch</h3>
              <button className="button secondary sm" onClick={() => setModal(false)}><X size={14}/></button>
            </div>
            <div className="modal-body">
              <label className="field-label" style={{ marginBottom: 12 }}>Batch ID / Name
                <input className="field-input" placeholder="e.g. SILAGE-006" value={batchName} onChange={e=>setBatchName(e.target.value)}/>
              </label>
              <label className="field-label" style={{ marginBottom: 16 }}>Type
                <select className="field-input" value={batchType} onChange={e=>setBatchType(e.target.value)}>
                  <option>Silage</option>
                  <option>Feed</option>
                </select>
              </label>
              <button className="button primary full" onClick={create}>Save Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── SCREEN 6: BATCH DETAIL & TREND PAGE ─────────────────── */
function BatchDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { apiFetch } = useApp()
  const [data, setData] = useState(null)

  useEffect(() => {
    apiFetch(`/api/batches/${id}`).then(setData).catch(console.error)
  }, [id, apiFetch])

  const batch = data?.batch || mockBatches[0]
  const tests = data?.tests || mockTests

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Batch Detail</h1>
          <p>Batch ID: <b style={{ color: 'var(--ink-900)' }}>{batch.id}</b></p>
        </div>
        <button className="button secondary" onClick={() => navigate('/batches')}>
          ← Back to Batches
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Batch Info Card (Matching Screen 6) */}
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>Batch Information</b>
          <table className="score-details-table">
            <tbody>
              <tr><td>Type</td><td>{batch.type}</td></tr>
              <tr><td>Feed Type</td><td>{batch.feedType}</td></tr>
              <tr><td>Created On</td><td>20 May 2025</td></tr>
              <tr><td>Storage Condition</td><td>{batch.storage || 'Covered'}</td></tr>
              <tr><td>Total Analyses</td><td>{tests.length || 5}</td></tr>
              <tr><td>Status</td><td><span className="badge good">Active</span></td></tr>
            </tbody>
          </table>
        </div>

        {/* Quality Trend Point Chart (Matching Screen 6) */}
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>Quality Trend</b>
          <div className="trend-svg-wrap">
            <svg viewBox="0 0 450 140" style={{ width: '100%', height: '100%' }}>
              <line x1="30" y1="20" x2="430" y2="20" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="30" y1="50" x2="430" y2="50" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="30" y1="80" x2="430" y2="80" stroke="#f1f5f9" strokeWidth="1"/>
              <line x1="30" y1="110" x2="430" y2="110" stroke="#f1f5f9" strokeWidth="1"/>

              <text x="10" y="24" fill="#94a3b8" fontSize="9">100</text>
              <text x="10" y="54" fill="#94a3b8" fontSize="9">75</text>
              <text x="10" y="84" fill="#94a3b8" fontSize="9">50</text>
              <text x="10" y="114" fill="#94a3b8" fontSize="9">25</text>

              <polyline
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                points="50,28 120,44 190,56 260,68 330,82 400,98"
              />
              {[
                [50,28,'91','10 May'],
                [120,44,'89','13 May'],
                [190,56,'85','16 May'],
                [260,68,'82','19 May'],
                [330,82,'78','22 May'],
                [400,98,'68','25 May']
              ].map(([cx,cy,val,dt], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                  <text x={cx} y={cy - 8} fill="var(--ink-900)" fontSize="10" fontWeight="700" textAnchor="middle">{val}</text>
                  <text x={cx} y="132" fill="#64748b" fontSize="9" textAnchor="middle">{dt}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Analyses in Batch */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Analyzed On</th>
              <th>Score</th>
              <th>Risk</th>
              <th>View Report</th>
            </tr>
          </thead>
          <tbody>
            {tests.slice(0, 5).map(t2 => (
              <tr key={t2.id || t2._id}>
                <td><b>{t2.id || t2._id}</b></td>
                <td>{t2.analyzedOn || '22 May 2025, 10:30 AM'}</td>
                <td><b>{t2.score || 87}</b></td>
                <td><span className={`badge ${riskClass(t2.overallStatus || t2.risk)}`}>{t2.overallStatus || t2.risk || 'Good'}</span></td>
                <td>
                  <Link to={`/analysis/${t2.id || t2._id}`} className="button secondary sm"><Eye size={12}/> View Report</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 7: HISTORY PAGE ─────────────────── */
function History() {
  const { apiFetch } = useApp()
  const [tests, setTests] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/tests').then(setTests).catch(console.error)
  }, [apiFetch])

  const list = tests.length > 0 ? tests : mockTests
  const filtered = list.filter(t => 
    (t.id?.toLowerCase().includes(search.toLowerCase()) || t.batchId?.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'All' || t.sampleType === typeFilter || t.type === typeFilter)
  )

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>History</h1>
          <p>View all your past analyses</p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            const csv = ['Sample ID,Batch ID,Type,Analyzed On,Score,Risk', ...filtered.map(r => `${r.id},${r.batchId || 'SILAGE-001'},${r.sampleType || r.type || 'Silage'},"${r.analyzedOn || '22 May 2025'}",${r.score || 80},${r.overallStatus || r.risk || 'Good'}`)].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'smartfeed_history.csv'; a.click()
          }}
        >
          <Download size={14}/> Export CSV
        </button>
      </div>

      <div className="table-container">
        {/* Filter Bar (Matching Screen 7) */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', top: 12, left: 12 }}/>
            <input className="field-input sm full" style={{ paddingLeft: 34 }} placeholder="Search by Sample ID or Batch ID..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="field-input sm" style={{ width: 120 }} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="All">Filter: All</option>
            <option value="Silage">Silage</option>
            <option value="Feed">Feed</option>
          </select>
          <div className="topbar-date-badge" style={{ padding: '4px 10px' }}>
            <Calendar size={12}/> 15 May 2025 – 22 May 2025
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Batch ID</th>
              <th>Type</th>
              <th>Analyzed On</th>
              <th>Score</th>
              <th>Risk</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page-1)*6, page*6).map(r => (
              <tr key={r.id || r._id}>
                <td><b>{r.id || r._id}</b></td>
                <td>{r.batchId || 'SILAGE-001'}</td>
                <td>{r.sampleType || r.type || 'Silage'}</td>
                <td>{r.analyzedOn || '22 May 2025, 10:30 AM'}</td>
                <td><b>{r.score || 87}</b></td>
                <td><span className={`badge ${riskClass(r.overallStatus || r.risk)}`}>{r.overallStatus || r.risk || 'Good'}</span></td>
                <td>
                  <Link to={`/analysis/${r.id || r._id}`} className="button secondary sm"><Eye size={12}/> View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
          <span>Showing 1 to {Math.min(6, filtered.length)} of {filtered.length} results</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="button secondary sm" disabled={page === 1} onClick={()=>setPage(p=>p-1)}>&lt;</button>
            <button className="button primary sm">{page}</button>
            <button className="button secondary sm" onClick={()=>setPage(p=>p+1)}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 8: AI ASSISTANT PAGE ─────────────────── */
function Assistant() {
  const { apiFetch } = useApp()
  const [messages, setMessages] = useState([
    { from: 'user', text: 'My silage score is 62. What should I do?', time: '10:30 AM' },
    { from: 'bot', text: 'A score of 62 indicates caution. It means there are some visual quality concerns. I recommend the following:\n\n• Check for any mold or unusual smell\n• Ensure proper storage and cover\n• Monitor the batch closely\n• Consider laboratory testing if the score keeps dropping', time: '10:30 AM' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = async (txt) => {
    const q = txt || input
    if (!q.trim()) return
    setInput('')
    setMessages(m => [...m, { from: 'user', text: q, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
    setTyping(true)

    try {
      const data = await apiFetch('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: q, history: messages.map(m=>({ from: m.from, text: m.text })) })
      })
      setMessages(m => [...m, { from: 'bot', text: data.text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
    } catch (e) {
      setMessages(m => [...m, { from: 'bot', text: 'Error connecting to Gemini assistant.', time: 'Now' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>AI Assistant</h1>
          <p>Ask me anything about feed & silage quality</p>
        </div>
        <button className="button secondary" onClick={() => setMessages([])}>
          <Trash2 size={13}/> Clear Chat
        </button>
      </div>

      <div className="card chat-window-card">
        <div className="chat-scroll-area">
          {messages.map((m, i) => (
            <div key={i} className={`chat-message-row ${m.from}`}>
              {m.from === 'bot' && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eafaf0', color: '#16a34a', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Bot size={18}/>
                </div>
              )}
              <div>
                <div className="chat-message-bubble" style={{ whiteSpace: 'pre-line' }}>
                  {m.text}
                </div>
                <small style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 4, display: 'block', textAlign: m.from === 'user' ? 'right' : 'left' }}>
                  {m.from === 'bot' ? 'AI Assistant · ' : 'You · '}{m.time}
                </small>
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-message-row bot">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eafaf0', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                <Bot size={18}/>
              </div>
              <div className="chat-message-bubble">
                <span className="spin" style={{ display: 'inline-block' }}>◓</span> Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="chat-input-toolbar">
          <div className="quick-prompt-chips">
            {['What does score 62 mean?', 'How to detect white mold?', 'Ideal moisture for maize silage?'].map(prompt => (
              <button key={prompt} type="button" className="chip-btn" onClick={() => send(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="chat-bar-inner">
            <input
              className="field-input full"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="button primary" onClick={() => send()}>
              <Send size={15}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 9: REPORTS PAGE ─────────────────── */
function Reports() {
  const { apiFetch, toast } = useApp()
  const [tab, setTab] = useState('Sample Reports')
  const [reports, setReports] = useState([])
  const [modal, setModal] = useState(false)
  const [refName, setRefName] = useState('SF-2025-1256')

  const load = async () => {
    try {
      const data = await apiFetch('/api/reports')
      if (Array.isArray(data)) setReports(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [apiFetch])

  const generate = async () => {
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ type: tab === 'Sample Reports' ? 'Sample Report' : 'Batch Report', ref: refName })
      })
      setModal(false)
      load()
      toast('Report generated successfully', 'success')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const list = reports.length > 0 ? reports : mockReports

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Reports</h1>
          <p>Generate and download reports</p>
        </div>
        <button className="button primary" onClick={() => setModal(true)}>
          <Plus size={14}/> Generate New Report
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12 }}>
          {['Sample Reports', 'Batch Reports'].map(tb => (
            <button
              key={tb}
              className={`button ${tab === tb ? 'primary sm' : 'secondary sm'}`}
              onClick={() => setTab(tb)}
            >
              {tb}
            </button>
          ))}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Type</th>
              <th>Generated On</th>
              <th>Sample/Batch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td><b>{r.id}</b></td>
                <td>{r.type}</td>
                <td>{r.date || '22 May 2025, 10:30 AM'}</td>
                <td>{r.ref || 'SF-2025-1256'}</td>
                <td>
                  <button className="button secondary sm" onClick={() => window.print()}>
                    <Download size={13}/> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate New Report</h3>
              <button className="button secondary sm" onClick={() => setModal(false)}><X size={14}/></button>
            </div>
            <div className="modal-body">
              <label className="field-label" style={{ marginBottom: 12 }}>Report Type
                <select className="field-input" value={tab} onChange={e=>setTab(e.target.value)}>
                  <option>Sample Reports</option>
                  <option>Batch Reports</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 16 }}>Reference Sample / Batch ID
                <input className="field-input" value={refName} onChange={e=>setRefName(e.target.value)}/>
              </label>
              <button className="button primary full" onClick={generate}>Generate Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── SILAGE COACH & OTHER PAGES ─────────────────── */
function SilageCoach() {
  const { apiFetch, toast } = useApp()
  const [stages, setStages] = useState([])
  const [steps, setSteps] = useState([])

  const load = async () => {
    try {
      const data = await apiFetch('/api/silage-coach?batchId=SILAGE-001')
      setStages(data.stages || [])
      setSteps(data.steps || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [apiFetch])

  const toggle = async (stageNum, item) => {
    const step = steps.find(s => s.stageNumber === stageNum) || {}
    const checked = step.checkedItems || []
    const next = checked.includes(item) ? checked.filter(x=>x!==item) : [...checked, item]
    const def = stages.find(s => s.stageNumber === stageNum)
    await apiFetch(`/api/silage-coach/stage/${stageNum}`, {
      method: 'PUT',
      body: JSON.stringify({ batchId: 'SILAGE-001', completed: next.length === (def?.checklist?.length || 3), checkedItems: next })
    })
    load()
    toast(`Stage ${stageNum} updated`, 'success')
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Make Silage Right™ Coach</h1>
          <p>Follow 5-stage agronomy milestones to eliminate mold and maximize quality</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {stages.map(stage => {
          const step = steps.find(s => s.stageNumber === stage.stageNumber) || {}
          const isDone = step.completed
          return (
            <div key={stage.stageNumber} className="card" style={{ borderLeft: isDone ? '4px solid #16a34a' : '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <b>{stage.title}</b>
                <span className={`badge ${isDone ? 'good' : 'caution'}`}>{isDone ? 'Completed' : 'Pending'}</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 12 }}>{stage.desc}</p>
              <div style={{ display: 'grid', gap: 6 }}>
                {stage.checklist.map((c, i) => {
                  const isChecked = (step.checkedItems || []).includes(c)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }} onClick={() => toggle(stage.stageNumber, c)}>
                      {isChecked ? <CheckSquare size={16} color="#16a34a"/> : <Square size={16} color="#94a3b8"/>}
                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>{c}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Analytics() {
  const { apiFetch } = useApp()
  const [analytics, setAnalytics] = useState(null)
  useEffect(() => { apiFetch('/api/analytics').then(setAnalytics).catch(console.error) }, [apiFetch])

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>Comprehensive quality metrics across all feed batches</p>
        </div>
      </div>
      <div className="card">
        <b style={{ display: 'block', marginBottom: 12 }}>Batch Performance Summary</b>
        <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>Average Screening Quality: <b>{analytics?.averageScore || 81}/100</b> across <b>{analytics?.totalTests || 128}</b> total sample analyses.</p>
      </div>
    </div>
  )
}

function Profile() {
  const { user } = useApp()
  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>Farmer Profile</h1><p>Manage your account and dairy herd details</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div className="topbar-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{user?.name ? user.name[0] : 'R'}</div>
          <div>
            <b style={{ fontSize: 18 }}>{user?.name || 'Farmer Raj'}</b>
            <small style={{ display: 'block', color: 'var(--ink-500)' }}>{user?.email || 'raj@farm.com'} · {user?.location || 'Anand, Gujarat'}</small>
          </div>
        </div>
        <div className="form-field-group">
          <label className="field-label">Full Name<input className="field-input" defaultValue={user?.name || 'Farmer Raj'}/></label>
          <label className="field-label">Phone<input className="field-input" defaultValue={user?.phone || '+91 98765 43210'}/></label>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const { settings, setSetting, lang, switchLang } = useApp()
  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>Settings</h1><p>Configure your SmartFeed AI preferences</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600, display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>Dark Mode</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>Toggle sleek dark theme</small></div>
          <input type="checkbox" checked={settings.darkMode} onChange={e => setSetting('darkMode', e.target.checked)}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>Interface Language</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>Change language</small></div>
          <select className="field-input sm" value={lang} onChange={e=>switchLang(e.target.value)}>
            <option>English</option>
            <option>हिंदी</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-canvas)' }}>
      <div className="card" style={{ width: 360, textAlign: 'center' }}>
        <div className="brand-logo-icon" style={{ margin: '0 auto 12px' }}><Leaf size={20}/></div>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Welcome to SmartFeed AI</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 20 }}>Dairy Feed & Silage Intelligence</p>
        <button className="button primary full lg" onClick={() => { login({ name: 'Farmer Raj', email: 'raj@farm.com' }, 'demo-token'); navigate('/dashboard'); }}>
          Sign In as Demo Farmer →
        </button>
      </div>
    </div>
  )
}

export default App
