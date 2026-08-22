import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, BarChart3, Bot, ChevronRight, ClipboardCheck, Download, FileText, Filter,
  HelpCircle, Home, Languages, Leaf, LogOut, Menu, Package, Plus, ScanSearch,
  Settings, ShieldCheck, Star, TrendingUp, Upload, UserCircle, X, Zap, AlertTriangle,
  CheckCircle, Bell, Search, Calendar, Eye, RefreshCw, Send, Trash2, CheckCheck, QrCode,
  CheckSquare, Square, DollarSign, HeartPulse, Sparkles, MessageSquare, Headphones,
  Camera, Info, ShieldAlert, FileSpreadsheet, ArrowUpRight
} from 'lucide-react'
import { mockBatches, mockReports, mockTests, resultParameters, trendData } from './mockData'

const riskClass = risk => {
  const r = String(risk || '').toLowerCase()
  if (r.includes('good') || r.includes('low')) return 'good'
  if (r.includes('caution') || r.includes('mod') || r.includes('warning')) return 'caution'
  return 'high'
}

/* ── Global App Context (language, settings, toast, auth) ── */
const AppCtx = createContext({})
function useApp() { return useContext(AppCtx) }

const LANGS = {
  English: {
    dashboard: 'Dashboard', newAnalysis: 'New Analysis', myBatches: 'My Batches',
    silageCoach: 'Silage Coach', history: 'History', analytics: 'Analytics', reports: 'Reports',
    aiAssistant: 'AI Assistant', milkYield: 'Milk Yield', profile: 'Profile', settings: 'Settings',
    welcomeBack: 'Welcome back', totalAnalyses: 'Total Analyses', goodQuality: 'Good Quality',
    caution: 'Caution', highRisk: 'High Risk', averageScore: 'Average Score',
    qualityTrend: 'Quality Trend (All Batches)', riskDistribution: 'Risk Distribution',
    recentAnalyses: 'Recent Analyses', sampleId: 'Sample ID', batchId: 'Batch ID',
    type: 'Type', analyzedOn: 'Analyzed On', score: 'Score', risk: 'Risk',
    action: 'Action', viewReport: 'View Report', addNewBatch: 'Add New Batch',
    exportCsv: 'Export CSV', needHelp: 'Need Help?', contactSupport: 'Contact Support',
    sampleReports: 'Sample Reports', batchReports: 'Batch Reports',
    generateReport: 'Generate New Report', clearChat: 'Clear Chat',
    typeQuestion: 'Type your question...',
    screeningEst: 'Screening estimate — not a laboratory measurement.',
    disclaimer: '⚠️ Screening Estimate Only — This is an AI-assisted visual screening tool. Not a certified laboratory assay. Confirm with lab/LFA tests before major herd feeding decisions.',
    lfaRecommend: 'Lab / LFA Rapid Test Recommended',
    lfaRecommendText: 'Risk level is Elevated. For regulatory compliance or herd safety, confirm with an on-farm Lateral Flow Assay (LFA) or accredited diagnostic lab.',
    logYield: 'Log Milk Yield', yieldDate: 'Date', yieldLiters: 'Total Yield (Liters)',
    cowCount: 'Cow Count', yieldNotes: 'Notes (Ration / Herd conditions)', saveYield: 'Save Milk Log',
    yieldHistory: 'Milk Production History', avgPerCow: 'Avg/Cow (L/day)',
    uploadImage: 'Upload Feed / Silage Image', sampleInfo: 'Sample Information',
    sampleType: 'Sample Type', feedType: 'Feed Category',
    storageDuration: 'Storage Duration (Days)', storageCondition: 'Storage Condition',
    temperature: 'Ambient Temp (°C)', humidity: 'Relative Humidity (%)', smell: 'Aroma / Smell',
    notesOpt: 'Farmer Observations / Notes (Optional)', analyzeBtn: 'Analyze Sample with Gemini AI',
    analyzing: 'Analyzing Sample with Gemini Vision AI...', newAnalysisDesc: 'Upload a clear photo for real-time computer vision quality screening',
    keyIndicators: 'Visual Key Indicators', aiExplanation: 'AI Explanation & Heatmap Focus',
    nutritionParams: 'Estimated Nutritional & Safety Parameters', advisories: 'Instant Agronomy Advisories',
    mycotoxinRisk: 'Mycotoxin Risk Radar', costQuality: 'Economic Impact / Cost of Poor Quality',
    analysisSummary: 'Quality Screening Overview', allBatches: 'All Batches',
    batchInfo: 'Batch Information', qualityTrend2: 'Batch Quality Trend',
    batchAnal: 'Analyses in this Batch', milkYieldLog: 'Milk Yield Log',
    noData: 'No data available yet.',
  },
  हिंदी: {
    dashboard: 'डैशबोर्ड', newAnalysis: 'नया विश्लेषण', myBatches: 'मेरे बैच',
    silageCoach: 'साइलेज कोच', history: 'इतिहास', analytics: 'विश्लेषिकी', reports: 'रिपोर्ट',
    aiAssistant: 'AI सहायक', milkYield: 'दूध उत्पादन', profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स',
    welcomeBack: 'स्वागत है', totalAnalyses: 'कुल विश्लेषण', goodQuality: 'अच्छी गुणवत्ता',
    caution: 'सावधानी', highRisk: 'उच्च जोखिम', averageScore: 'औसत स्कोर',
    qualityTrend: 'गुणवत्ता प्रवृत्ति (सभी बैच)', riskDistribution: 'जोखिम वितरण',
    recentAnalyses: 'हाल के विश्लेषण', sampleId: 'नमूना ID', batchId: 'बैच ID',
    type: 'प्रकार', analyzedOn: 'विश्लेषण दिनांक', score: 'स्कोर', risk: 'जोखिम',
    action: 'कार्रवाई', viewReport: 'रिपोर्ट देखें', addNewBatch: 'नया बैच जोड़ें',
    exportCsv: 'CSV निर्यात करें', needHelp: 'सहायता चाहिए?', contactSupport: 'सपोर्ट से संपर्क करें',
    sampleReports: 'नमूना रिपोर्ट', batchReports: 'बैच रिपोर्ट',
    generateReport: 'नई रिपोर्ट बनाएं', clearChat: 'चैट साफ़ करें',
    typeQuestion: 'अपना प्रश्न यहाँ लिखें...',
    screeningEst: 'स्क्रीनिंग अनुमान — प्रयोगशाला परीक्षण नहीं।',
    disclaimer: '⚠️ केवल स्क्रीनिंग अनुमान — यह AI-सहायक दृश्य स्क्रीनिंग टूल है। प्रमाणित प्रयोगशाला माप नहीं। बड़े निर्णयों से पहले LFA या लैब परीक्षण से पुष्टि करें।',
    lfaRecommend: 'लैब / LFA परीक्षण अनुशंसित',
    lfaRecommendText: 'जोखिम स्तर बढ़ा हुआ है। पशु स्वास्थ्य व सुरक्षा के लिए प्रमाणित प्रयोगशाला या LFA परीक्षण किट से पुष्टि करें।',
    logYield: 'दूध उत्पादन दर्ज करें', yieldDate: 'दिनांक', yieldLiters: 'कुल उत्पादन (लीटर)',
    cowCount: 'गायों की संख्या', yieldNotes: 'नोट्स (चारा / स्वास्थ्य स्थिति)', saveYield: 'दूध डेटा सहेजें',
    yieldHistory: 'दूध उत्पादन इतिहास', avgPerCow: 'औसत/गाय (लीटर/दिन)',
    uploadImage: 'चारा / साइलेज की फोटो अपलोड करें', sampleInfo: 'नमूना जानकारी',
    sampleType: 'नमूना प्रकार', feedType: 'चारा श्रेणी',
    storageDuration: 'भंडारण अवधि (दिन)', storageCondition: 'भंडारण स्थिति',
    temperature: 'तापमान (°C)', humidity: 'आर्द्रता (%)', smell: 'गंध / सुगंध',
    notesOpt: 'किसान अवलोकन / नोट्स (वैकल्पिक)', analyzeBtn: 'Gemini AI से विश्लेषण करें',
    analyzing: 'Gemini Vision AI से विश्लेषण हो रहा है...', newAnalysisDesc: 'तत्काल गुणवत्ता स्क्रीनिंग के लिए एक स्पष्ट फोटो अपलोड करें',
    keyIndicators: 'दृश्य मुख्य संकेतक', aiExplanation: 'AI स्पष्टीकरण और हीटमैप',
    nutritionParams: 'अनुमानित पोषण और सुरक्षा पैरामीटर', advisories: 'कृषि सलाह और अनुशंसाएं',
    mycotoxinRisk: 'माइकोटॉक्सिन जोखिम रडार', costQuality: 'खराब गुणवत्ता की आर्थिक लागत',
    analysisSummary: 'गुणवत्ता स्क्रीनिंग सारांश', allBatches: 'सभी बैच',
    batchInfo: 'बैच जानकारी', qualityTrend2: 'बैच गुणवत्ता प्रवृत्ति',
    batchAnal: 'इस बैच में विश्लेषण', milkYieldLog: 'दूध उत्पादन लॉग',
    noData: 'अभी कोई डेटा उपलब्ध नहीं है।',
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

  const apiFetch = useCallback(async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `HTTP error! Status: ${res.status}`)
    }
    return res.json()
  }, [token])

  const toast = (msg, type = 'info', duration = 3500) => {
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

  const switchLang = (l) => { setLang(l) }

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
            {toasts.map(t2 => (
              <div key={t2.id} style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <CheckCircle size={14} color="#22c55e" />
                <span>{t2.msg}</span>
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
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-logo-icon"><Leaf size={18}/></div>
          <b style={{ fontSize: 16, color: 'var(--ink-900)', fontFamily: 'var(--font-heading)' }}>SmartFeed AI</b>
        </div>
        <nav className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#capabilities">Nutritional Tech</a>
          <a href="#contact">Contact</a>
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary sm" onClick={() => navigate('/login')}>Login</button>
          <button className="button primary sm" onClick={() => navigate('/analysis/new')}>Get Started</button>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div>
          <div className="hero-badge-pill">
            <Sparkles size={13}/> AI-Powered Feed & Silage Intelligence
          </div>
          <h1 className="hero-title">Smarter Feed Decisions.<br/>Healthier Herds.</h1>
          <p className="hero-desc">
            Instant on-farm quality assessment of cattle feed, fodder, and silage using multimodal computer vision & rapid agronomy analytics.
          </p>
          <ul className="hero-check-list">
            <li><CheckCircle size={15} color="#16a34a"/> Detect mycotoxins, mold & adulteration early</li>
            <li><CheckCircle size={15} color="#16a34a"/> Predict crude protein, moisture & energy</li>
            <li><CheckCircle size={15} color="#16a34a"/> Boost milk production with instant advisory</li>
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
              <b style={{ fontSize: 12, display: 'block', color: 'var(--ink-900)' }}>Trusted by 500+ Dairy Farmers & Cooperatives</b>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#eab308" color="#eab308"/>)}
                <small style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-700)', marginLeft: 4 }}>4.9/5 Field Rating</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-preview-card">
          <img src="/silage_sample.jpg" alt="Silage Screening" className="hero-preview-img" onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
          <div className="hero-floating-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>✦ Live AI Screening</span>
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
                <span style={{ color: 'var(--ink-500)' }}>Screening Risk</span><b style={{ color: '#16a34a' }}>Low Risk (92% Conf.)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>Sample Type</span><b>Maize Silage</b>
              </div>
            </div>
            <button className="button primary sm full" style={{ marginTop: 8 }} onClick={() => navigate('/dashboard')}>
              View Full Analysis →
            </button>
          </div>
        </div>
      </section>

      <section className="landing-ribbon" id="features">
        <div className="ribbon-grid">
          <div className="ribbon-item">
            <div className="ribbon-icon"><ScanSearch size={20}/></div>
            <b>Multimodal AI Vision</b>
            <small>Gemini-powered rapid visual screening</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><AlertTriangle size={20}/></div>
            <b>Mycotoxin & Mold Radar</b>
            <small>Aflatoxin, vomitoxin & spoilage alerts</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><TrendingUp size={20}/></div>
            <b>Batch Intelligence</b>
            <small>Track quality trends and milk yield correlations</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><ClipboardCheck size={20}/></div>
            <b>Make Silage Right™ Coach</b>
            <small>5-stage step-by-step fermentation checklist</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><HeartPulse size={20}/></div>
            <b>Milk Yield Optimization</b>
            <small>Correlate daily feed quality with production</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><QrCode size={20}/></div>
            <b>QR Authenticity & Traceability</b>
            <small>Instant scan verification for cooperatives</small>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────── APP SHELL (SIDEBAR & TOPBAR) ─────────────────── */
function Shell() {
  const navigate = useNavigate()
  const { t, lang, switchLang, user } = useApp()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  if (!user) return null

  const navItems = [
    ['/dashboard', t.dashboard, BarChart3],
    ['/analysis/new', t.newAnalysis, ScanSearch],
    ['/batches', t.myBatches, Package],
    ['/coach', t.silageCoach, ClipboardCheck],
    ['/milk-yield', t.milkYield, HeartPulse],
    ['/history', t.history, Activity],
    ['/analytics', t.analytics, TrendingUp],
    ['/reports', t.reports, FileText],
    ['/assistant', t.aiAssistant, Bot],
    ['/profile', t.profile, UserCircle],
    ['/settings', t.settings, Settings],
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo-icon"><Leaf size={17}/></div>
          <div className="brand-text-wrap">
            <b>SmartFeed AI</b>
            <small>Dairy Quality System</small>
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

        <div className="sidebar-support-card" onClick={() => navigate('/assistant')}>
          <Headphones size={18} color="#88be99"/>
          <div>
            <b>{t.needHelp}</b>
            <small>{t.contactSupport}</small>
          </div>
        </div>

        <div className="sidebar-lang-toggle">
          <span>Language / भाषा</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`lang-chip-btn ${lang === 'English' ? 'active' : ''}`} onClick={() => switchLang('English')}>EN</button>
            <button className={`lang-chip-btn ${lang === 'हिंदी' ? 'active' : ''}`} onClick={() => switchLang('हिंदी')}>हिंदी</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <h2>SmartFeed AI</h2>
          </div>

          <div className="topbar-right">
            <div className="topbar-date-badge">
              <Calendar size={13} color="var(--brand-primary)"/>
              <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            <button className="topbar-icon-btn" onClick={() => navigate('/analytics')}>
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
          <Route path="/milk-yield" element={<MilkYield/>}/>
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

  const total = analytics?.totalTests || tests.length || 6
  const good = analytics?.riskDistribution?.Good ?? 0
  const caution = analytics?.riskDistribution?.Warning ?? 0
  const high = analytics?.riskDistribution?.Bad ?? 0
  const avgScore = analytics?.averageScore ?? 81

  const trendArr = analytics?.trendData?.['7 days'] || [87, 82, 76, 68, 81]
  const svgW = 440, svgH = 140, padL = 42, padR = 20, padT = 20, padB = 25
  const chartW = svgW - padL - padR
  const chartH = svgH - padT - padB
  const minV = Math.max(0, Math.min(...trendArr) - 8)
  const maxV = Math.min(100, Math.max(...trendArr) + 5)
  const tx = (i) => padL + (i / Math.max(1, trendArr.length - 1)) * chartW
  const ty = (v) => padT + chartH - ((v - minV) / (maxV - minV || 1)) * chartH
  const polyPts = trendArr.map((v, i) => `${tx(i)},${ty(v)}`).join(' ')

  const CIRC = 238.7
  const goodPct = total > 0 ? good / total : 0
  const cautionPct = total > 0 ? caution / total : 0
  const highPct = total > 0 ? high / total : 0

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.dashboard}</h1>
          <p>{t.welcomeBack}, {user?.name || 'Farmer Raj'} 👋</p>
        </div>
        <button className="button primary" onClick={() => navigate('/analysis/new')}>
          <Plus size={15}/> {t.newAnalysis}
        </button>
      </div>

      <div className="dashboard-stat-grid">
        <div className="stat-metric-card">
          <small>{t.totalAnalyses}</small>
          <div className="stat-metric-value-row"><b>{total}</b><span className="stat-metric-delta good">Live DB</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.goodQuality}</small>
          <div className="stat-metric-value-row"><b>{good}</b><span className="stat-metric-delta good">{total > 0 ? Math.round((good/total)*100) : 0}% of total</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.caution}</small>
          <div className="stat-metric-value-row"><b>{caution}</b><span className="stat-metric-delta caution">{total > 0 ? Math.round((caution/total)*100) : 0}% of total</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.highRisk}</small>
          <div className="stat-metric-value-row"><b>{high}</b><span className="stat-metric-delta high">{total > 0 ? Math.round((high/total)*100) : 0}% of total</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.averageScore}</small>
          <div className="stat-metric-value-row"><b>{avgScore}/100</b><span className="stat-metric-delta good">AI Score</span></div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
        <div className="card chart-card-wrap">
          <div className="card-head">
            <b>{t.qualityTrend}</b>
          </div>
          <div className="trend-svg-wrap">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[0,25,50,75,100].map(v => {
                const y = ty(Math.min(maxV, Math.max(minV, v)))
                if (y < padT - 2 || y > padT + chartH + 2) return null
                return <g key={v}>
                  <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
                  <text x={padL - 4} y={y + 4} fill="#94a3b8" fontSize="9" textAnchor="end">{v}</text>
                </g>
              })}
              <polygon fill="url(#tg)" points={`${tx(0)},${padT+chartH} ${polyPts} ${tx(trendArr.length-1)},${padT+chartH}`}/>
              <polyline fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyPts}/>
              {trendArr.map((v, i) => (
                <g key={i}>
                  <circle cx={tx(i)} cy={ty(v)} r="4" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                  <text x={tx(i)} y={ty(v) - 8} fill="#0f172a" fontSize="9" fontWeight="700" textAnchor="middle">{v}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="card donut-chart-container">
          <div className="card-head" style={{ width: '100%', marginBottom: 8 }}><b>{t.riskDistribution}</b></div>
          <div className="donut-circle-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#fee2e2" strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset="0"/>
              {cautionPct > 0 && <circle cx="50" cy="50" r="38" fill="none" stroke="#fef3c7" strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - cautionPct - highPct)}/>}
              {goodPct > 0 && <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - goodPct)}/>}
            </svg>
            <div className="donut-center-label"><b>{total}</b><small>Total</small></div>
          </div>
          <div className="donut-legend-stack">
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#16a34a' }}/>{t.goodQuality} ({total > 0 ? Math.round((good/total)*100) : 0}%)</span><b>{good}</b></div>
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#f59e0b' }}/>{t.caution} ({total > 0 ? Math.round((caution/total)*100) : 0}%)</span><b>{caution}</b></div>
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#ef4444' }}/>{t.highRisk} ({total > 0 ? Math.round((high/total)*100) : 0}%)</span><b>{high}</b></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14 }}>{t.recentAnalyses}</b>
          <Link to="/history" style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 700 }}>View All →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>{t.sampleId}</th><th>{t.batchId}</th><th>{t.type}</th><th>{t.analyzedOn}</th><th>{t.score}</th><th>{t.risk}</th><th>{t.action}</th></tr>
          </thead>
          <tbody>
            {(tests.length > 0 ? tests : mockTests).slice(0, 5).map(t2 => {
              const risk = t2.overallStatus || t2.risk || 'Good'
              const id = t2.id || t2._id
              const dateStr = t2.analyzedOn || (t2.createdAt ? new Date(t2.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '22 May 2026')
              return (
                <tr key={id}>
                  <td><b>{id}</b></td>
                  <td>{t2.batchId || 'SILAGE-001'}</td>
                  <td>{t2.sampleType || t2.type || 'Silage'}</td>
                  <td>{dateStr}</td>
                  <td><b>{t2.score ?? 87}</b></td>
                  <td><span className={`badge ${riskClass(risk)}`}>{risk}</span></td>
                  <td><Link to={`/analysis/${id}`} className="button secondary sm"><Eye size={12}/> View</Link></td>
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
  const { t, toast, apiFetch } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sampleType, setSampleType] = useState('Silage')
  const [feedType, setFeedType] = useState('Maize Silage')
  const [storageDuration, setStorageDuration] = useState('20')
  const [storageCondition, setStorageCondition] = useState('Covered Pit')
  const [tempC, setTempC] = useState('32')
  const [humidityPct, setHumidityPct] = useState('65')
  const [smell, setSmell] = useState('Sweet Lactic')
  const [batchId, setBatchId] = useState('SILAGE-001')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = f => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!file) return toast('Please select or capture a feed/silage image first', 'error')

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
          tempC: Number(tempC) || 32,
          humidityPct: Number(humidityPct) || 65,
          smell,
          notes,
          batchId
        })
      })
      toast('Screening analysis completed with Gemini Vision AI!', 'success')
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
          <h1>{t.newAnalysis}</h1>
          <p>{t.newAnalysisDesc}</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze}>
        <div className="analysis-split-grid">
          <div className="card">
            <b style={{ display: 'block', fontSize: 13, marginBottom: 14 }}>{t.uploadImage}</b>
            <div className="upload-dropzone" onClick={() => fileInputRef.current?.click()}>
              {preview ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={preview} alt="Upload Preview" style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 8 }}/>
                  <button type="button" className="button secondary sm" style={{ marginTop: 12 }} onClick={(e)=>{e.stopPropagation();setFile(null);setPreview(null)}}>
                    Change Photo
                  </button>
                </div>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e=>handleFileSelect(e.target.files[0])}/>
                  <div className="upload-cloud-icon"><Upload size={24}/></div>
                  <b style={{ fontSize: 14, color: 'var(--ink-900)', marginBottom: 4 }}>Drag & drop image or browse files</b>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>Works with smartphone camera photo</span>
                  <span className="button secondary sm" style={{ pointerEvents: 'none' }}>Browse Files</span>
                  <small style={{ color: 'var(--ink-400)', fontSize: 10, marginTop: 16 }}>Supports: JPG, PNG, JPEG (Max 15MB)</small>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <b style={{ display: 'block', fontSize: 13, marginBottom: 14 }}>{t.sampleInfo}</b>
            <div className="form-field-group">
              <label className="field-label">{t.sampleType} *
                <select className="field-input" value={sampleType} onChange={e=>setSampleType(e.target.value)}>
                  <option value="Silage">Silage</option>
                  <option value="Feed">Concentrate Feed / Grain</option>
                </select>
              </label>
              <label className="field-label">{t.feedType}
                <select className="field-input" value={feedType} onChange={e=>setFeedType(e.target.value)}>
                  <option value="Maize Silage">Maize Silage (मक्का साइलेज)</option>
                  <option value="Grass Silage">Hybrid Napier / Grass Silage (घास साइलेज)</option>
                  <option value="Sorghum Silage">Sorghum Silage (ज्वार साइलेज)</option>
                  <option value="Cattle Feed Pellet">Cattle Feed Pellet (कैटल फीड पेलेट)</option>
                  <option value="Dairy Concentrate">Dairy Concentrate Mash (कंसंट्रेट मेश)</option>
                </select>
              </label>
            </div>

            <div className="form-field-group">
              <label className="field-label">{t.storageDuration}
                <input type="number" className="field-input" value={storageDuration} onChange={e=>setStorageDuration(e.target.value)}/>
              </label>
              <label className="field-label">{t.storageCondition}
                <select className="field-input" value={storageCondition} onChange={e=>setStorageCondition(e.target.value)}>
                  <option value="Covered Pit">Covered Trench / Pit (कवर्ड गड्ढा)</option>
                  <option value="Silo Bag">Silo Bag (साइलो बैग)</option>
                  <option value="Shed Covered">Shed Covered Bags (शेड कवर्ड)</option>
                  <option value="Open Air Stack">Open Air Stack (खुला ढेर - High Risk)</option>
                </select>
              </label>
            </div>

            <div className="form-field-group">
              <label className="field-label">{t.temperature}
                <input type="number" className="field-input" value={tempC} onChange={e=>setTempC(e.target.value)}/>
              </label>
              <label className="field-label">{t.humidity}
                <input type="number" className="field-input" value={humidityPct} onChange={e=>setHumidityPct(e.target.value)}/>
              </label>
            </div>

            <div className="form-field-group">
              <label className="field-label">{t.smell}
                <select className="field-input" value={smell} onChange={e=>setSmell(e.target.value)}>
                  <option value="Sweet Lactic">Pleasant Sweet Lactic Acid (मीठी अम्लीय - Good)</option>
                  <option value="Neutral">Neutral Grain Aroma (सामान्य अनाज)</option>
                  <option value="Vinegar">Pungent Acetic / Vinegar (सिरके जैसी)</option>
                  <option value="Putrid">Rancid / Butyric Butter (सड़ा मक्खन - Spoiled)</option>
                  <option value="Musty">Musty / Moldy (फफूंद गंध)</option>
                </select>
              </label>
              <label className="field-label">{t.batchId}
                <select className="field-input" value={batchId} onChange={e=>setBatchId(e.target.value)}>
                  <option value="SILAGE-001">SILAGE-001 (Maize Pit)</option>
                  <option value="SILAGE-002">SILAGE-002 (Grass Silo Bag)</option>
                  <option value="SILAGE-003">SILAGE-003 (Open Stack)</option>
                  <option value="FEED-001">FEED-001 (Cattle Feed Pellet)</option>
                  <option value="FEED-002">FEED-002 (Dairy Concentrate)</option>
                </select>
              </label>
            </div>

            <label className="field-label" style={{ marginBottom: 20 }}>{t.notesOpt}
              <textarea className="field-input" rows={2} placeholder="Any visible signs, rain exposure, or cattle intake observations..." value={notes} onChange={e=>setNotes(e.target.value)}/>
            </label>

            <button type="submit" className="button primary full lg" disabled={loading}>
              {loading ? <><RefreshCw size={16} className="spin"/> {t.analyzing}</> : t.analyzeBtn}
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
  const { t, apiFetch } = useApp()
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

  const score = Number(test.score ?? 84)
  const risk = test.overallStatus || test.risk || 'Good'
  const confidence = test.confidence || 92
  const minConf = test.confidenceInterval?.min ?? Math.max(0, score - 4)
  const maxConf = test.confidenceInterval?.max ?? Math.min(100, score + 4)
  const isHighRisk = risk === 'Bad' || risk === 'Warning' || score < 75

  const paramsObj = test.parameters instanceof Map ? Object.fromEntries(test.parameters) : (test.parameters || {})

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analysisSummary}</h1>
          <p>Sample ID: <b style={{ color: 'var(--ink-900)' }}>{test.id || test._id}</b> · Batch: <b>{test.batchId || 'SILAGE-001'}</b></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary" onClick={() => window.print()}>
            <Download size={14}/> Print / Export PDF
          </button>
        </div>
      </div>

      <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0 }}/>
        <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
          {t.disclaimer}
        </div>
      </div>

      <div className="result-top-grid">
        <div className="card score-display-card">
          <div className="score-radial-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray="264" strokeDashoffset={`${264 - (264 * score)/100}`} strokeLinecap="round"/>
            </svg>
            <div className="score-radial-inner">
              <b style={{ color: score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#ef4444' }}>{score}</b>
              <small style={{ fontSize: 11, color: 'var(--ink-500)' }}>/100</small>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <span className={`badge ${riskClass(risk)}`} style={{ marginBottom: 12, display: 'inline-block' }}>
              {risk === 'Good' ? 'Good Quality (उत्कृष्ट)' : risk === 'Warning' ? 'Moderate Risk / Caution (सावधानी)' : 'High Risk / Action Required (उच्च जोखिम)'}
            </span>
            <table className="score-details-table">
              <tbody>
                <tr><td>Screening Status</td><td style={{ fontWeight: 700 }}>{risk}</td></tr>
                <tr><td>Sample / Feed Type</td><td>{test.feedType || test.sampleType || 'Silage'}</td></tr>
                <tr><td>Analyzed On</td><td>{test.analyzedOn || (test.createdAt ? new Date(test.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '22 May 2026')}</td></tr>
                <tr><td>Model Confidence</td><td><b>{confidence}%</b> ({minConf} - {maxConf}% CI)</td></tr>
                <tr><td>AI Engine</td><td><span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{test.aiModelUsed || 'gemini-2.0-flash'}</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>Analyzed Sample Photo</b>
          <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', background: '#0f172a' }}>
            <img src={test.image || "/silage_sample.jpg"} alt="Feed Sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
            {(test.heatmapRegions && test.heatmapRegions.length > 0 ? test.heatmapRegions : [
              { x: 42, y: 40, radius: 24, impact: 'low', label: 'Fermented Core' },
              { x: 75, y: 28, radius: 18, impact: risk === 'Bad' ? 'high' : 'medium', label: 'Aerobic Boundary' }
            ]).map((hr, idx) => (
              <div
                key={idx}
                title={hr.label}
                style={{
                  position: 'absolute',
                  left: `${hr.x}%`,
                  top: `${hr.y}%`,
                  width: `${(hr.radius || 20) * 2}px`,
                  height: `${(hr.radius || 20) * 2}px`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: hr.impact === 'high' ? 'rgba(239, 68, 68, 0.45)' : hr.impact === 'medium' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(22, 163, 74, 0.35)',
                  border: hr.impact === 'high' ? '2px solid #ef4444' : hr.impact === 'medium' ? '2px solid #f59e0b' : '2px solid #16a34a',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                ●
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 8, color: 'var(--ink-500)' }}>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> Low Impact Area</span>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> Risk Marker</span>
          </div>
        </div>
      </div>

      {isHighRisk && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldAlert size={24} color="#dc2626" style={{ flexShrink: 0 }}/>
          <div>
            <b style={{ fontSize: 13, color: '#991b1b', display: 'block' }}>{t.lfaRecommend}</b>
            <span style={{ fontSize: 12, color: '#7f1d1d' }}>{t.lfaRecommendText}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 14 }}>{t.keyIndicators}</b>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(test.keyIndicators && test.keyIndicators.length > 0 ? test.keyIndicators : [
              'Uniform olive-green matrix indicating lactic fermentation',
              'Consistent forage particle distribution with low aerobic decay',
              'Optimal estimated moisture range (60-65%)',
              'No visible black, white, or blue-green mycotoxin mold clusters'
            ]).map((ind, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>{ind}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>Quality Score Range</b>
            <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> Good (80-100)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 4 }}/> Caution (50-79)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> High Risk (0-49)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>{t.aiExplanation}</b>
          <p style={{ fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.55, marginBottom: 14 }}>
            {test.aiExplanation || 'Visual analysis detected normal forage matrix with healthy preservation traits. Rumen fermentation is expected to proceed smoothly with balanced roughage.'}
          </p>
          {qr?.qrDataUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <img src={qr.qrDataUrl} alt="Traceability QR" style={{ width: 56, height: 56 }}/>
              <div>
                <b style={{ fontSize: 11, display: 'block', color: 'var(--ink-900)' }}>QR Authenticity Verification</b>
                <small style={{ fontSize: 10, color: 'var(--ink-500)' }}>Traceability ID: {qr.traceabilityId || test.id}</small>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 14 }}>{t.nutritionParams}</b>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parameter</th><th>Estimated Value</th><th>Unit</th><th>Optimal Range</th><th>Screening Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(paramsObj).length > 0 ? (
                Object.entries(paramsObj).map(([key, p]) => (
                  <tr key={key}>
                    <td><b>{p.label || key.replace('_', ' ').toUpperCase()}</b></td>
                    <td><b>{p.value}</b></td>
                    <td>{p.unit || '—'}</td>
                    <td><small style={{ color: 'var(--ink-500)' }}>{p.optimalRange || 'Standard'}</small></td>
                    <td><span className={`badge ${riskClass(p.status || 'Good')}`}>{p.status || 'Good'}</span></td>
                  </tr>
                ))
              ) : (
                resultParameters.map(([name, val, unit, st]) => (
                  <tr key={name}>
                    <td><b>{name}</b></td><td><b>{val}</b></td><td>{unit || '—'}</td>
                    <td><small style={{ color: 'var(--ink-500)' }}>Standard</small></td>
                    <td><span className={`badge ${riskClass(st)}`}>{st}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>{t.mycotoxinRisk}</b>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Overall Mycotoxin Tier:</span>
              <span className={`badge ${riskClass(test.mycotoxinRiskRadar?.overallRiskTier || 'Low Risk')}`}>{test.mycotoxinRiskRadar?.overallRiskTier || 'Low Risk'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Aflatoxin Risk Index:</span><b>{test.mycotoxinRiskRadar?.aflatoxinRiskScore || 15}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Vomitoxin (DON) Index:</span><b>{test.mycotoxinRiskRadar?.vomitoxinRiskScore || 10}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Zearalenone Index:</span><b>{test.mycotoxinRiskRadar?.zearalenoneRiskScore || 12}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Estimated Mold Percentage:</span><b>{test.mycotoxinRiskRadar?.calculatedFactors?.moldPercentage || 1.2}%</b>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>{t.costQuality}</b>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>Estimated Daily Herd Loss:</span>
              <b style={{ color: test.costOfPoorQuality?.dailyLossInr > 0 ? '#ef4444' : '#16a34a' }}>
                ₹{test.costOfPoorQuality?.dailyLossInr || 0} / day
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Milk Yield Penalty:</span>
              <b>{test.costOfPoorQuality?.milkDropLitersPerCow || 0} L / cow / day</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Veterinary Risk Exposure:</span>
              <b>₹{test.costOfPoorQuality?.vetCostRiskInr || 0}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>Estimated Spoilage Rate:</span>
              <b>{test.costOfPoorQuality?.estimatedSpoilagePct || 1.5}%</b>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>{t.advisories}</b>
        <div style={{ display: 'grid', gap: 8 }}>
          {(test.advisories && test.advisories.length > 0 ? test.advisories : [
            'Maintain daily trench feeding depth (15-20cm) to prevent secondary aerobic spoilage.',
            'Ensure Total Mixed Ration balances energy with adequate dry matter intake.'
          ]).map((adv, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12.5, borderLeft: '3px solid #16a34a' }}>
              {adv}
            </div>
          ))}
        </div>
        {test.recommendations && (
          <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-700)', fontWeight: 600 }}>
            Farmer Recommendation: {test.recommendations}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 5: MY BATCHES PAGE ─────────────────── */
function Batches() {
  const navigate = useNavigate()
  const { t, apiFetch, toast } = useApp()
  const [batches, setBatches] = useState([])
  const [modal, setModal] = useState(false)
  const [batchIdInput, setBatchIdInput] = useState('')
  const [batchType, setBatchType] = useState('Silage')
  const [feedType, setFeedType] = useState('Maize Silage')
  const [notes, setNotes] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await apiFetch('/api/batches')
      if (Array.isArray(data)) setBatches(data)
    } catch (e) { console.error(e) }
  }, [apiFetch])

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!batchIdInput.trim()) return toast('Please provide a Batch ID', 'error')
    try {
      await apiFetch('/api/batches', {
        method: 'POST',
        body: JSON.stringify({ id: batchIdInput.trim(), type: batchType, feedType, notes })
      })
      setModal(false)
      setBatchIdInput('')
      load()
      toast('New batch created successfully', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  const list = batches.length > 0 ? batches : mockBatches

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.myBatches}</h1>
          <p>Manage and track feed & silage batches across storage cycles</p>
        </div>
        <button className="button primary" onClick={() => setModal(true)}>
          <Plus size={14}/> {t.addNewBatch}
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Batch ID</th><th>Type</th><th>Feed Type</th><th>Created On</th><th>Analyses</th><th>Avg Score</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => {
              const bId = b.id || b._id
              return (
                <tr key={bId}>
                  <td><b>{b.id}</b></td>
                  <td>{b.type}</td>
                  <td>{b.feedType}</td>
                  <td>{b.createdOn || (b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '20 May 2026')}</td>
                  <td>{b.analysesCount || b.analyses || 4}</td>
                  <td><b>{b.averageScore || 82}/100</b></td>
                  <td><span className="badge good">{b.status || 'Active'}</span></td>
                  <td>
                    <button className="button secondary sm" onClick={() => navigate(`/batches/${b.id || b._id}`)}>
                      <Eye size={12}/> View
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Batch</h3>
              <button className="button secondary sm" onClick={() => setModal(false)}><X size={14}/></button>
            </div>
            <div className="modal-body">
              <label className="field-label" style={{ marginBottom: 12 }}>Batch ID
                <input className="field-input" placeholder="e.g. SILAGE-004" value={batchIdInput} onChange={e=>setBatchIdInput(e.target.value)}/>
              </label>
              <label className="field-label" style={{ marginBottom: 12 }}>Type
                <select className="field-input" value={batchType} onChange={e=>setBatchType(e.target.value)}>
                  <option value="Silage">Silage</option>
                  <option value="Feed">Feed Concentrate</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 12 }}>Feed Type
                <select className="field-input" value={feedType} onChange={e=>setFeedType(e.target.value)}>
                  <option value="Maize Silage">Maize Silage</option>
                  <option value="Grass Silage">Hybrid Napier Grass Silage</option>
                  <option value="Cattle Feed Pellet">Cattle Feed Pellet</option>
                  <option value="Dairy Concentrate">Dairy Concentrate</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 16 }}>Notes
                <textarea className="field-input" rows={2} placeholder="Storage location, harvest notes..." value={notes} onChange={e=>setNotes(e.target.value)}/>
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
  const { t, apiFetch, toast } = useApp()
  const [data, setData] = useState(null)
  const [yieldDate, setYieldDate] = useState(new Date().toISOString().slice(0, 10))
  const [yieldLiters, setYieldLiters] = useState('15.0')
  const [cowCount, setCowCount] = useState('12')

  const load = useCallback(() => {
    apiFetch(`/api/batches/${id}`).then(setData).catch(console.error)
  }, [id, apiFetch])

  useEffect(() => { load() }, [load])

  const handleLogYield = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/milk-yield', {
        method: 'POST',
        body: JSON.stringify({ batchId: id, date: yieldDate, yieldLiters: Number(yieldLiters), cowCount: Number(cowCount) })
      })
      toast('Milk yield logged successfully for this batch!', 'success')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const batch = data?.batch || mockBatches[0]
  const tests = data?.tests || mockTests

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.batchInfo}</h1>
          <p>Batch ID: <b style={{ color: 'var(--ink-900)' }}>{batch.id}</b> · {batch.feedType}</p>
        </div>
        <button className="button secondary" onClick={() => navigate('/batches')}>
          ← Back to Batches
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>{t.batchInfo}</b>
          <table className="score-details-table">
            <tbody>
              <tr><td>Type</td><td>{batch.type}</td></tr>
              <tr><td>Feed Type</td><td>{batch.feedType}</td></tr>
              <tr><td>Storage</td><td>{batch.storage || 'Covered Pit'}</td></tr>
              <tr><td>Total Analyses</td><td>{tests.length || 4}</td></tr>
              <tr><td>Average Quality Score</td><td><b>{batch.averageScore || 82}/100</b></td></tr>
              <tr><td>Status</td><td><span className="badge good">{batch.status || 'Active'}</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 10 }}>Quick Milk Yield Logger</b>
          <form onSubmit={handleLogYield} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label className="field-label">{t.yieldDate}
              <input type="date" className="field-input" value={yieldDate} onChange={e=>setYieldDate(e.target.value)}/>
            </label>
            <label className="field-label">{t.yieldLiters}
              <input type="number" step="0.1" className="field-input" value={yieldLiters} onChange={e=>setYieldLiters(e.target.value)}/>
            </label>
            <label className="field-label">{t.cowCount}
              <input type="number" className="field-input" value={cowCount} onChange={e=>setCowCount(e.target.value)}/>
            </label>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="button primary full sm">
                {t.saveYield}
              </button>
            </div>
          </form>
          <div style={{ marginTop: 14, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 11, color: 'var(--ink-700)' }}>
            💡 Log milk yields over time to track how this feed batch affects daily herd production.
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}>
          <b>{t.batchAnal}</b>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Sample ID</th><th>Analyzed On</th><th>Score</th><th>Risk</th><th>Action</th></tr>
          </thead>
          <tbody>
            {tests.map(t2 => (
              <tr key={t2.id || t2._id}>
                <td><b>{t2.id || t2._id}</b></td>
                <td>{t2.analyzedOn || '22 May 2026, 10:30 AM'}</td>
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

/* ─────────────────── SCREEN: MILK YIELD LOGGING PAGE ─────────────────── */
function MilkYield() {
  const { t, apiFetch, toast } = useApp()
  const [logs, setLogs] = useState([])
  const [batchId, setBatchId] = useState('SILAGE-001')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [yieldLiters, setYieldLiters] = useState('15.0')
  const [cowCount, setCowCount] = useState('12')
  const [notes, setNotes] = useState('')

  const load = useCallback(() => {
    apiFetch('/api/milk-yield').then(setLogs).catch(console.error)
  }, [apiFetch])

  useEffect(() => { load() }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/milk-yield', {
        method: 'POST',
        body: JSON.stringify({ batchId, date, yieldLiters: Number(yieldLiters), cowCount: Number(cowCount), notes })
      })
      toast('Milk yield logged successfully!', 'success')
      setNotes('')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/milk-yield/${id}`, { method: 'DELETE' })
      toast('Log entry deleted', 'info')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.milkYield}</h1>
          <p>Track dairy herd lactation performance and correlate with feed nutritional screening</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>{t.logYield}</b>
          <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
            <label className="field-label">{t.batchId}
              <select className="field-input" value={batchId} onChange={e=>setBatchId(e.target.value)}>
                <option value="SILAGE-001">SILAGE-001 (Maize Silage)</option>
                <option value="SILAGE-002">SILAGE-002 (Grass Silage)</option>
                <option value="SILAGE-003">SILAGE-003 (Open Stack Silage)</option>
                <option value="FEED-001">FEED-001 (Cattle Feed Pellet)</option>
              </select>
            </label>
            <label className="field-label">{t.yieldDate}
              <input type="date" className="field-input" value={date} onChange={e=>setDate(e.target.value)}/>
            </label>
            <label className="field-label">{t.yieldLiters}
              <input type="number" step="0.1" className="field-input" value={yieldLiters} onChange={e=>setYieldLiters(e.target.value)}/>
            </label>
            <label className="field-label">{t.cowCount}
              <input type="number" className="field-input" value={cowCount} onChange={e=>setCowCount(e.target.value)}/>
            </label>
            <label className="field-label">{t.yieldNotes}
              <input className="field-input" placeholder="e.g. Afternoon milking, high heat" value={notes} onChange={e=>setNotes(e.target.value)}/>
            </label>
            <button type="submit" className="button primary full">
              {t.saveYield}
            </button>
          </form>
        </div>

        <div className="table-container">
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}>
            <b>{t.yieldHistory}</b>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>{t.yieldDate}</th><th>{t.batchId}</th><th>Total (L)</th><th>{t.cowCount}</th><th>{t.avgPerCow}</th><th>Notes</th><th>Action</th></tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map(l => (
                  <tr key={l._id || l.id}>
                    <td><b>{l.date}</b></td>
                    <td>{l.batchId}</td>
                    <td><b>{l.yieldLiters} L</b></td>
                    <td>{l.cowCount || 12}</td>
                    <td><span className="badge good">{l.avgPerCow || (Math.round((l.yieldLiters/(l.cowCount||12))*100)/100)} L/cow</span></td>
                    <td><small style={{ color: 'var(--ink-500)' }}>{l.notes || '—'}</small></td>
                    <td>
                      <button className="button secondary sm" onClick={() => handleDelete(l._id || l.id)}>
                        <Trash2 size={12}/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>No milk logs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 7: HISTORY PAGE ─────────────────── */
function History() {
  const { t, apiFetch } = useApp()
  const [tests, setTests] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/api/tests').then(setTests).catch(console.error)
  }, [apiFetch])

  const list = tests.length > 0 ? tests : mockTests
  const filtered = list.filter(t2 => 
    (String(t2.id || t2._id || '').toLowerCase().includes(search.toLowerCase()) || String(t2.batchId || '').toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'All' || t2.sampleType === typeFilter || t2.type === typeFilter)
  )

  const exportCSV = () => {
    const header = 'Sample ID,Batch ID,Type,Analyzed On,Score,Risk,Screening Disclaimer\n'
    const rows = filtered.map(r => 
      `"${r.id || r._id}","${r.batchId || 'SILAGE-001'}","${r.sampleType || r.type || 'Silage'}","${r.analyzedOn || '22 May 2026'}",${r.score || 80},"${r.overallStatus || r.risk || 'Good'}","Screening estimate — not a laboratory measurement."`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SmartFeed_Quality_History_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.history}</h1>
          <p>Access past quality screening analyses with traceable authenticity</p>
        </div>
        <button className="button secondary" onClick={exportCSV}>
          <Download size={14}/> {t.exportCsv}
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', top: 12, left: 12 }}/>
            <input className="field-input sm full" style={{ paddingLeft: 34 }} placeholder="Search by Sample ID or Batch ID..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="field-input sm" style={{ width: 130 }} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Silage">Silage</option>
            <option value="Feed">Feed</option>
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{t.sampleId}</th><th>{t.batchId}</th><th>{t.type}</th><th>{t.analyzedOn}</th><th>{t.score}</th><th>{t.risk}</th><th>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page-1)*8, page*8).map(r => {
              const risk = r.overallStatus || r.risk || 'Good'
              const id = r.id || r._id
              const dateStr = r.analyzedOn || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '22 May 2026')
              return (
                <tr key={id}>
                  <td><b>{id}</b></td>
                  <td>{r.batchId || 'SILAGE-001'}</td>
                  <td>{r.sampleType || r.type || 'Silage'}</td>
                  <td>{dateStr}</td>
                  <td><b>{r.score ?? 87}</b></td>
                  <td><span className={`badge ${riskClass(risk)}`}>{risk}</span></td>
                  <td>
                    <Link to={`/analysis/${id}`} className="button secondary sm"><Eye size={12}/> View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
          <span>Showing 1 to {Math.min(8, filtered.length)} of {filtered.length} results</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="button secondary sm" disabled={page === 1} onClick={()=>setPage(p=>p-1)}>&lt;</button>
            <button className="button primary sm">{page}</button>
            <button className="button secondary sm" disabled={page * 8 >= filtered.length} onClick={()=>setPage(p=>p+1)}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 8: AI ASSISTANT PAGE ─────────────────── */
function Assistant() {
  const { t, lang, apiFetch } = useApp()
  const [messages, setMessages] = useState([
    { from: 'bot', text: lang === 'हिंदी' ? 'नमस्ते किसान भाई! मैं आपका SmartFeed AI सहायक हूँ। साइलेज गुणवत्ता, नमी, टीएमआर राशन संतुलन, फफूंद रोकथाम, या दूध उत्पादन के बारे में कुछ भी पूछें।' : 'Hello! I am your SmartFeed AI Agronomist & Animal Nutritionist. Ask me anything about feed quality, silage moisture (60-68%), pH, mycotoxin prevention, or ration balancing.' }
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
        body: JSON.stringify({ message: q, history: messages.map(m=>({ from: m.from, text: m.text })), language: lang })
      })
      setMessages(m => [...m, { from: 'bot', text: data.text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
    } catch (e) {
      setMessages(m => [...m, { from: 'bot', text: 'Error connecting to Gemini assistant. Please try again.', time: 'Now' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.aiAssistant}</h1>
          <p>Context-aware conversational agronomist powered by Gemini AI</p>
        </div>
        <button className="button secondary" onClick={() => setMessages([])}>
          <Trash2 size={13}/> {t.clearChat}
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
                  {m.from === 'bot' ? 'SmartFeed AI · ' : 'You · '}{m.time || 'Now'}
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
                <span className="spin" style={{ display: 'inline-block' }}>◓</span> Consulting Gemini AI agronomist...
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="chat-input-toolbar">
          <div className="quick-prompt-chips">
            {['What does score 62 mean?', 'How to prevent white mold in pit?', 'Ideal moisture for maize silage?', 'How to increase milk yield with TMR?'].map(prompt => (
              <button key={prompt} type="button" className="chip-btn" onClick={() => send(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="chat-bar-inner">
            <input
              className="field-input full"
              placeholder={t.typeQuestion}
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
  const { t, apiFetch, toast } = useApp()
  const [tab, setTab] = useState('Sample Reports')
  const [reports, setReports] = useState([])
  const [modal, setModal] = useState(false)
  const [refName, setRefName] = useState('SF-2026-1256')

  const load = useCallback(async () => {
    try {
      const data = await apiFetch('/api/reports')
      if (Array.isArray(data)) setReports(data)
    } catch (e) { console.error(e) }
  }, [apiFetch])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ type: tab === 'Sample Reports' ? 'Sample Report' : 'Batch Report', ref: refName })
      })
      setModal(false)
      load()
      toast('Report generated successfully with Gemini summary!', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  const exportReportCSV = (r) => {
    const content = `Report ID,${r.id}\nType,${r.type}\nReference,${r.ref || 'SF-2026-1256'}\nDate,${r.date || '22 May 2026'}\nSummary,"${r.summary || 'Feed Quality Screening Report'}"\nDisclaimer,"Screening estimate only — not a certified laboratory assay."\n`
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${r.id}_Report.csv`
    a.click()
  }

  const list = reports.length > 0 ? reports : mockReports

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.reports}</h1>
          <p>Generate, download, and share structured quality screening reports</p>
        </div>
        <button className="button primary" onClick={() => setModal(true)}>
          <Plus size={14}/> {t.generateReport}
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
            <tr><th>Report ID</th><th>Type</th><th>Generated On</th><th>Reference</th><th>Summary</th><th>Action</th></tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td><b>{r.id}</b></td>
                <td>{r.type}</td>
                <td>{r.date || '22 May 2026, 10:30 AM'}</td>
                <td><b>{r.ref || 'SF-2026-1256'}</b></td>
                <td><small style={{ color: 'var(--ink-700)' }}>{r.summary ? r.summary.slice(0, 75) + '...' : 'Verified quality parameters'}</small></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="button secondary sm" onClick={() => exportReportCSV(r)}>
                      <Download size={13}/> CSV
                    </button>
                    <button className="button secondary sm" onClick={() => window.print()}>
                      Print
                    </button>
                  </div>
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

/* ─────────────────── SCREEN: SILAGE COACH PAGE ─────────────────── */
function SilageCoach() {
  const { t, apiFetch, toast } = useApp()
  const [stages, setStages] = useState([])
  const [steps, setSteps] = useState([])

  const load = useCallback(async () => {
    try {
      const data = await apiFetch('/api/silage-coach?batchId=SILAGE-001')
      setStages(data.stages || [])
      setSteps(data.steps || [])
    } catch (e) { console.error(e) }
  }, [apiFetch])

  useEffect(() => { load() }, [load])

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
    toast(`Stage ${stageNum} milestone updated`, 'success')
  }

  const completedCount = steps.filter(s => s.completed).length
  const progressPct = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Make Silage Right™ Coach</h1>
          <p>Follow 5-stage agronomy milestones to eliminate mycotoxins and maximize lactic acid preservation</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <b>Batch Silage Preparation Progress: {progressPct}% Complete</b>
          <span className="badge good">{completedCount} of {stages.length} Stages Verified</span>
        </div>
        <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: '#16a34a', transition: 'width 0.4s ease' }}/>
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
                <span className={`badge ${isDone ? 'good' : 'caution'}`}>{isDone ? 'Completed (सत्यापित)' : 'In Progress (प्रगति पर)'}</span>
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

/* ─────────────────── SCREEN: ANALYTICS PAGE ─────────────────── */
function Analytics() {
  const { t, apiFetch } = useApp()
  const [analytics, setAnalytics] = useState(null)
  useEffect(() => { apiFetch('/api/analytics').then(setAnalytics).catch(console.error) }, [apiFetch])

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analytics}</h1>
          <p>Comprehensive dairy herd feed quality intelligence & historical telemetry</p>
        </div>
      </div>

      <div className="dashboard-stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-metric-card">
          <small>Total Assessed Batches</small>
          <div className="stat-metric-value-row"><b>{analytics?.activeBatches || 5}</b></div>
        </div>
        <div className="stat-metric-card">
          <small>Average Feed Health Index</small>
          <div className="stat-metric-value-row"><b>{analytics?.averageScore || 81} / 100</b></div>
        </div>
        <div className="stat-metric-card">
          <small>Safe Feeding Ratio</small>
          <div className="stat-metric-value-row"><b style={{ color: '#16a34a' }}>{Math.round(((analytics?.riskDistribution?.Good || 4) / (analytics?.totalTests || 6)) * 100)}%</b></div>
        </div>
      </div>

      <div className="card">
        <b style={{ display: 'block', fontSize: 14, marginBottom: 12 }}>Feed Type Distribution in Storage</b>
        <div style={{ display: 'grid', gap: 10 }}>
          {Object.entries(analytics?.feedTypeDistribution || { 'Maize Silage': 3, 'Cattle Feed Pellet': 1, 'Grass Silage': 1, 'Dairy Concentrate': 1 }).map(([ft, count]) => (
            <div key={ft}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>{ft}</span>
                <b>{count} samples</b>
              </div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(count / (analytics?.totalTests || 6)) * 100}%`, height: '100%', background: '#16a34a' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN: PROFILE & SETTINGS ─────────────────── */
function Profile() {
  const { user } = useApp()
  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>Farmer Profile</h1><p>Manage your account, cooperative credentials, and herd parameters</p></div>
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
        <div className="form-field-group">
          <label className="field-label">Location<input className="field-input" defaultValue={user?.location || 'Anand, Gujarat'}/></label>
          <label className="field-label">Dairy Herd Size (Cows)<input className="field-input" defaultValue="24"/></label>
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
        <div><h1>Settings</h1><p>Configure interface and operational options</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600, display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>Dark Mode</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>Toggle dark theme</small></div>
          <input type="checkbox" checked={settings.darkMode} onChange={e => setSetting('darkMode', e.target.checked)}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>Interface Language</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>Switch between English & Hindi</small></div>
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
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>SmartFeed AI</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 20 }}>Dairy Cattle Feed & Silage Intelligence</p>
        <button className="button primary full lg" onClick={() => { login({ name: 'Farmer Raj', email: 'raj@farm.com' }, 'demo-token'); navigate('/dashboard'); }}>
          Sign In as Demo Farmer →
        </button>
      </div>
    </div>
  )
}

export default App
