import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, BarChart3, Bot, ChevronRight, ClipboardCheck, Download, FileText, Filter,
  HelpCircle, Home, Languages, Leaf, LogOut, Menu, Package, Plus, ScanSearch,
  Settings, ShieldCheck, Star, TrendingUp, Upload, UserCircle, X, Zap, AlertTriangle,
  CheckCircle, Bell, Search, Calendar, Eye, RefreshCw, Send, Trash2, CheckCheck, QrCode,
  CheckSquare, Square, DollarSign, HeartPulse, Sparkles, MessageSquare, Headphones,
  Camera, Info, ShieldAlert, FileSpreadsheet, ArrowUpRight, Mic, MicOff, Volume2,
  Lightbulb, MapPin, TrendingDown, Award, Timer, Salad
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { mockBatches, mockReports, mockTests, resultParameters, trendData } from './mockData'
import { LANGS, LOCALIZED_TERMS, loc } from './translations'

const riskClass = risk => {
  const r = String(risk || '').toLowerCase()
  if (r.includes('good') || r.includes('low')) return 'good'
  if (r.includes('caution') || r.includes('mod') || r.includes('warning')) return 'caution'
  return 'high'
}

/* ── Global App Context (language, settings, toast, auth) ── */
const AppCtx = createContext({})
function useApp() { return useContext(AppCtx) }

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
  const locTerm = useCallback((term) => loc(term, lang), [lang])

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('smartfeed_user', JSON.stringify(userData))
    localStorage.setItem('smartfeed_token', userToken)
    toast(t.loggedInToast || 'Logged in successfully', 'success')
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
    <AppCtx.Provider value={{ lang, t, loc: locTerm, settings, setSetting, switchLang, toast, user, token, login, logout, apiFetch }}>
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
  const { t, lang, switchLang, loc: locTerm } = useApp()

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-logo-icon"><Leaf size={18}/></div>
          <b style={{ fontSize: 16, color: 'var(--ink-900)', fontFamily: 'var(--font-heading)' }}>{t.brandName}</b>
        </div>
        <nav className="landing-nav-links">
          <a href="#home">{t.navHome}</a>
          <a href="#features">{t.navFeatures}</a>
          <a href="#capabilities">{t.navTech}</a>
          <a href="#contact">{t.navContact}</a>
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, marginRight: 6 }}>
            <button className={`lang-chip-btn ${lang === 'English' ? 'active' : ''}`} onClick={() => switchLang('English')}>EN</button>
            <button className={`lang-chip-btn ${lang === 'हिंदी' ? 'active' : ''}`} onClick={() => switchLang('हिंदी')}>हिंदी</button>
          </div>
          <button className="button secondary sm" onClick={() => navigate('/login')}>{t.loginBtn}</button>
          <button className="button primary sm" onClick={() => navigate('/analysis/new')}>{t.getStartedBtn}</button>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div>
          <div className="hero-badge-pill">
            <Sparkles size={13}/> {t.heroBadge}
          </div>
          <h1 className="hero-title">{t.heroTitle1}<br/>{t.heroTitle2}</h1>
          <p className="hero-desc">
            {t.heroDesc}
          </p>
          <ul className="hero-check-list">
            <li><CheckCircle size={15} color="#16a34a"/> {t.heroCheck1}</li>
            <li><CheckCircle size={15} color="#16a34a"/> {t.heroCheck2}</li>
            <li><CheckCircle size={15} color="#16a34a"/> {t.heroCheck3}</li>
          </ul>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="button primary lg" onClick={() => navigate('/analysis/new')}>
              {t.analyzeSampleHero} <ScanSearch size={16}/>
            </button>
            <button className="button secondary lg" onClick={() => navigate('/dashboard')}>
              {t.explorePlatform}
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="social-proof-avatars">
              <span>🌾</span><span>🐄</span><span>👨‍🌾</span>
            </div>
            <div>
              <b style={{ fontSize: 12, display: 'block', color: 'var(--ink-900)' }}>{t.trustedByFarmers}</b>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="#eab308" color="#eab308"/>)}
                <small style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-700)', marginLeft: 4 }}>{t.fieldRating}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-preview-card">
          <img src="/silage_sample.jpg" alt="Silage Screening" className="hero-preview-img" onError={e=>{e.target.src='https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'}}/>
          <div className="hero-floating-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-500)', textTransform: 'uppercase' }}>{t.liveAiScreening}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <b style={{ fontSize: 24, fontFamily: 'var(--font-heading)', color: '#16a34a' }}>87 / 100</b>
                <span className="badge good" style={{ display: 'block', width: 'fit-content', marginTop: 2 }}>{t.goodQuality}</span>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                <CheckCircle size={22}/>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-700)', display: 'grid', gap: 4, padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>{t.screeningStatus}</span><b style={{ color: '#16a34a' }}>{locTerm('Low Risk')} (92% Conf.)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-500)' }}>{t.sampleType}</span><b>{locTerm('Maize Silage')}</b>
              </div>
            </div>
            <button className="button primary sm full" style={{ marginTop: 8 }} onClick={() => navigate('/dashboard')}>
              {t.viewFullAnalysis}
            </button>
          </div>
        </div>
      </section>

      <section className="landing-ribbon" id="features">
        <div className="ribbon-grid">
          <div className="ribbon-item">
            <div className="ribbon-icon"><ScanSearch size={20}/></div>
            <b>{t.featVisionTitle}</b>
            <small>{t.featVisionDesc}</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><AlertTriangle size={20}/></div>
            <b>{t.featRadarTitle}</b>
            <small>{t.featRadarDesc}</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><TrendingUp size={20}/></div>
            <b>{t.featBatchTitle}</b>
            <small>{t.featBatchDesc}</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><ClipboardCheck size={20}/></div>
            <b>{t.featCoachTitle}</b>
            <small>{t.featCoachDesc}</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><HeartPulse size={20}/></div>
            <b>{t.featMilkTitle}</b>
            <small>{t.featMilkDesc}</small>
          </div>
          <div className="ribbon-item">
            <div className="ribbon-icon"><QrCode size={20}/></div>
            <b>{t.featQrTitle}</b>
            <small>{t.featQrDesc}</small>
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
            <b>{t.brandName}</b>
            <small>{t.brandSubtitle}</small>
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
          <span>{t.languageToggle}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className={`lang-chip-btn ${lang === 'English' ? 'active' : ''}`} onClick={() => switchLang('English')}>EN</button>
            <button className={`lang-chip-btn ${lang === 'हिंदी' ? 'active' : ''}`} onClick={() => switchLang('हिंदी')}>हिंदी</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title-wrap">
            <h2>{t.brandName}</h2>
          </div>

          <div className="topbar-right">
            <div className="topbar-date-badge">
              <Calendar size={13} color="var(--brand-primary)"/>
              <span>{new Date().toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            <button className="topbar-icon-btn" onClick={() => navigate('/analytics')}>
              <Bell size={16}/>
              <span className="topbar-notif-dot"/>
            </button>

            <div className="topbar-user-pill" onClick={() => navigate('/profile')}>
              <div className="topbar-avatar">{user?.name ? user.name[0].toUpperCase() : 'R'}</div>
              <div className="topbar-user-details">
                <b>{user?.name || (lang === 'हिंदी' ? 'किसान राज' : 'Farmer Raj')}</b>
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
const PRIORITY_CFG = {
  high:   { label: 'High Priority',   bg: '#fff1f2', border: '#fecaca', text: '#dc2626', icon: '🔴' },
  medium: { label: 'Medium Priority', bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: '🟡' },
  low:    { label: 'Low Priority',    bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '🟢' },
}
const CATEGORY_COLOR = {
  Fermentation: '#8b5cf6', Nutrition: '#0ea5e9', Storage: '#f59e0b',
  'Milk Yield': '#ec4899', 'Cost Saving': '#16a34a'
}

const REGIONAL_DATA = {
  'Anand, Gujarat': { regionName: 'Anand, Gujarat', avgScore: 68, topPct: 15, totalFarms: 240 },
  'Karnal, Haryana': { regionName: 'Karnal, Haryana', avgScore: 72, topPct: 22, totalFarms: 185 },
  'Pune, Maharashtra': { regionName: 'Pune, Maharashtra', avgScore: 65, topPct: 10, totalFarms: 310 },
  default: { regionName: 'Your Region', avgScore: 67, topPct: 20, totalFarms: 200 }
}

function SmartSuggestionsCard({ suggestions, onRefresh, loading }) {
  const navigate = useNavigate()
  const { t, lang, loc: locTerm } = useApp()
  const [showAll, setShowAll] = useState(false)
  const top3 = suggestions.slice(0, 3)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={16} color="#f59e0b"/>
          <b style={{ fontSize: 14 }}>{t.smartSuggestions}</b>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {suggestions.length > 3 && (
            <button className="button secondary sm" onClick={() => setShowAll(true)}>
              {t.seeAll} ({suggestions.length})
            </button>
          )}
          <button className="button secondary sm" onClick={onRefresh} title={t.refresh}>
            <RefreshCw size={12} className={loading ? 'spin' : ''}/> {t.refresh}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13 }}>
          <span className="spin" style={{ display: 'inline-block', marginRight: 8 }}>◓</span>
          {t.generatingSuggestions}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {top3.map((s, idx) => {
            const pri = PRIORITY_CFG[s.priority] || PRIORITY_CFG.medium
            const catColor = CATEGORY_COLOR[s.category] || '#64748b'
            return (
              <div key={s.id || idx} style={{
                padding: '14px 20px', borderBottom: idx < top3.length - 1 ? '1px solid var(--border-light)' : 'none',
                borderLeft: `3px solid ${pri.border}`, background: pri.bg, transition: '0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11 }}>{pri.icon}</span>
                      <b style={{ fontSize: 13, color: 'var(--ink-900)' }}>{s.title}</b>
                      <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '18', borderRadius: 4, padding: '1px 6px' }}>{locTerm(s.category)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: 0, lineHeight: 1.55 }}>{s.description}</p>
                  </div>
                  <button
                    className="button primary sm"
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => navigate(s.actionLink || '/dashboard')}
                  >
                    {s.actionLabel || t.actBtn} <ArrowUpRight size={11}/>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAll && (
        <div className="modal-backdrop" onClick={() => setShowAll(false)}>
          <div className="modal-box" style={{ maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <b style={{ fontSize: 16 }}>{t.allSuggestionsModal}</b>
              <button onClick={() => setShowAll(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((s, idx) => {
                const pri = PRIORITY_CFG[s.priority] || PRIORITY_CFG.medium
                const catColor = CATEGORY_COLOR[s.category] || '#64748b'
                return (
                  <div key={s.id || idx} style={{ padding: 14, borderRadius: 10, background: pri.bg, border: `1px solid ${pri.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span>{pri.icon}</span>
                      <b style={{ fontSize: 13 }}>{s.title}</b>
                      <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '18', borderRadius: 4, padding: '1px 6px' }}>{locTerm(s.category)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pri.text, marginLeft: 'auto' }}>{pri.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: '0 0 10px' }}>{s.description}</p>
                    <button className="button primary sm" onClick={() => { navigate(s.actionLink || '/dashboard'); setShowAll(false) }}>
                      {s.actionLabel || t.takeAction} <ArrowUpRight size={11}/>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { t, apiFetch, user, lang, loc: locTerm } = useApp()
  const [tests, setTests] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)

  const isHindi = lang === 'हिंदी'

  useEffect(() => {
    apiFetch(`/api/tests?lang=${lang}`).then(setTests).catch(console.error)
    apiFetch('/api/analytics').then(setAnalytics).catch(console.error)
  }, [apiFetch, lang])

  const loadSuggestions = useCallback((forceRefresh = false) => {
    setSuggestionsLoading(true)
    const url = forceRefresh ? `/api/suggestions?refresh=true&lang=${lang}` : `/api/suggestions?lang=${lang}`
    apiFetch(url)
      .then(data => {
        setSuggestions(data.suggestions || [])
        setSuggestionsLoading(false)
      })
      .catch(err => {
        console.error('[Suggestions]', err)
        setSuggestionsLoading(false)
        // Offline fallback suggestions localized
        setSuggestions([
          { id: 'f1', title: isHindi ? 'दैनिक साइलेज फेस जांच' : 'Daily Silage Pit Face Check', description: isHindi ? 'साइलेज फेस से रोजाना 15-20 सेमी परत निकालें और कसकर सील करें।' : 'Remove 15-20 cm evenly daily from the pit face and reseal tightly to prevent aerobic heating.', priority: 'high', category: 'Fermentation', actionLabel: isHindi ? 'विश्लेषण करें' : 'Analyze Sample', actionLink: '/analysis/new' },
          { id: 'f2', title: isHindi ? 'दूध उत्पादन लॉग दर्ज करें' : 'Log Today\'s Milk Production', description: isHindi ? 'नियमित दूध उत्पादन दर्ज करने से चारे की गुणवत्ता से संबंध देखा जा सकता है।' : 'Regular milk yield logging helps correlate feed quality changes with lactation performance.', priority: 'medium', category: 'Milk Yield', actionLabel: isHindi ? 'दूध लॉग करें' : 'Log Yield', actionLink: '/milk-yield' },
          { id: 'f3', title: isHindi ? 'साइलेज कोच जारी रखें' : 'Continue Silage Coach', description: isHindi ? 'साइलेज निर्माण के सभी चरण पूरे करें।' : 'Complete remaining Silage Coach stages to ensure optimal fermentation practices.', priority: 'low', category: 'Storage', actionLabel: isHindi ? 'कोच देखें' : 'Open Coach', actionLink: '/silage-coach' },
        ])
      })
  }, [apiFetch, isHindi, lang])

  useEffect(() => { loadSuggestions() }, [loadSuggestions])

  const total = analytics?.totalTests || tests.length || 6
  const good = analytics?.riskDistribution?.Good ?? 0
  const caution = analytics?.riskDistribution?.Warning ?? 0
  const high = analytics?.riskDistribution?.Bad ?? 0
  const avgScore = analytics?.averageScore ?? 81

  // Quality Streak (consecutive Good tests)
  const streak = (() => {
    const testList = tests.length > 0 ? tests : []
    let s = 0
    for (const t2 of testList) {
      if (t2.overallStatus === 'Good') s++
      else break
    }
    return s || 3
  })()

  // Regional Benchmark
  const userLocation = user?.location || 'Anand, Gujarat'
  const regionKey = Object.keys(REGIONAL_DATA).find(k => userLocation.includes(k.split(',')[0])) || 'default'
  const region = REGIONAL_DATA[regionKey]
  const isTopPerformer = avgScore > region.avgScore

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
          <p>{t.welcomeBack}, {user?.name || (isHindi ? 'किसान राज' : 'Farmer Raj')} 👋</p>
        </div>
        <button className="button primary" onClick={() => navigate('/analysis/new')}>
          <Plus size={15}/> {t.newAnalysis}
        </button>
      </div>

      {/* ── Stat Grid ── */}
      <div className="dashboard-stat-grid">
        <div className="stat-metric-card">
          <small>{t.totalAnalyses}</small>
          <div className="stat-metric-value-row"><b>{total}</b><span className="stat-metric-delta good">{t.liveDb}</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.goodQuality}</small>
          <div className="stat-metric-value-row"><b>{good}</b><span className="stat-metric-delta good">{total > 0 ? Math.round((good/total)*100) : 0}% {t.ofTotal}</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.caution}</small>
          <div className="stat-metric-value-row"><b>{caution}</b><span className="stat-metric-delta caution">{total > 0 ? Math.round((caution/total)*100) : 0}% {t.ofTotal}</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.highRisk}</small>
          <div className="stat-metric-value-row"><b>{high}</b><span className="stat-metric-delta high">{total > 0 ? Math.round((high/total)*100) : 0}% {t.ofTotal}</span></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.averageScore}</small>
          <div className="stat-metric-value-row"><b>{avgScore}/100</b><span className="stat-metric-delta good">{t.aiScore}</span></div>
        </div>
      </div>

      {/* ── Quality Streak + Regional Benchmark Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Quality Streak */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: streak >= 5 ? '#fef3c7' : '#f0fdf4', display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>
            {streak >= 7 ? '🥇' : streak >= 4 ? '🔥' : '✅'}
          </div>
          <div>
            <b style={{ fontSize: 22, color: streak >= 5 ? '#d97706' : '#16a34a' }}>{streak}</b>
            <span style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 4 }}>{t.dayQualityStreak}</span>
            <p style={{ fontSize: 11, color: 'var(--ink-400)', margin: '2px 0 0', lineHeight: 1.4 }}>
              {streak >= 7 ? t.streakGold : streak >= 4 ? t.streakGreat : t.streakMaintain}
            </p>
          </div>
        </div>

        {/* Regional Benchmark */}
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MapPin size={14} color="#8b5cf6"/>
            <b style={{ fontSize: 13 }}>{t.regionalBenchmark}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: isTopPerformer ? '#16a34a' : '#d97706' }}>{avgScore}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 4 }}>{t.yourScore}</span>
            <span style={{ fontSize: 16, color: 'var(--ink-300)', marginBottom: 4 }}>vs</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-500)', marginBottom: 2 }}>{region.avgScore}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 4 }}>{t.regionAvg}</span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }}>
            <div style={{ height: '100%', borderRadius: 4, background: isTopPerformer ? '#16a34a' : '#f59e0b', width: `${Math.min(100, avgScore)}%`, transition: '1s ease' }}/>
          </div>
          <p style={{ fontSize: 11, color: isTopPerformer ? '#16a34a' : '#d97706', fontWeight: 700, margin: 0 }}>
            {isTopPerformer
              ? t.topPercent.replace('{region}', region.regionName).replace('{pct}', region.topPct)
              : t.belowAvg.replace('{pts}', region.avgScore - avgScore)}
          </p>
        </div>
      </div>

      {/* ── Smart Suggestions ── */}
      <div style={{ marginBottom: 16 }}>
        <SmartSuggestionsCard
          suggestions={suggestions}
          onRefresh={() => loadSuggestions(true)}
          loading={suggestionsLoading}
        />
      </div>

      {/* ── Charts ── */}
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
            <div className="donut-center-label"><b>{total}</b><small>{lang === 'हिंदी' ? 'कुल' : 'Total'}</small></div>
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
          <Link to="/history" style={{ fontSize: 12, color: 'var(--brand-primary)', fontWeight: 700 }}>{t.viewAll}</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>{t.sampleId}</th><th>{t.batchId}</th><th>{t.type}</th><th>{t.analyzedOn}</th><th>{t.score}</th><th>{t.risk}</th><th>{t.action}</th></tr>
          </thead>
          <tbody>
            {(tests.length > 0 ? tests : mockTests).slice(0, 5).map(t2 => {
              const risk = t2.overallStatus || t2.risk || 'Good'
              const id = t2.id || t2._id
              const dateStr = t2.analyzedOn || (t2.createdAt ? new Date(t2.createdAt).toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '22 May 2026')
              return (
                <tr key={id}>
                  <td><b>{id}</b></td>
                  <td>{t2.batchId || 'SILAGE-001'}</td>
                  <td>{locTerm(t2.sampleType || t2.type || 'Silage')}</td>
                  <td>{dateStr}</td>
                  <td><b>{t2.score ?? 87}</b></td>
                  <td><span className={`badge ${riskClass(risk)}`}>{locTerm(risk)}</span></td>
                  <td><Link to={`/analysis/${id}`} className="button secondary sm"><Eye size={12}/> {t.view}</Link></td>
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
  const { t, toast, apiFetch, lang, loc: locTerm } = useApp()
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
    if (!file) return toast(t.selectFileError || 'Please select or capture a feed/silage image first', 'error')

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
          batchId,
          language: lang
        })
      })
      toast(t.analysisCompletedToast || 'Screening analysis completed with Gemini Vision AI!', 'success')
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
                    {t.changePhoto}
                  </button>
                </div>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e=>handleFileSelect(e.target.files[0])}/>
                  <div className="upload-cloud-icon"><Upload size={24}/></div>
                  <b style={{ fontSize: 14, color: 'var(--ink-900)', marginBottom: 4 }}>{t.dragDropText}</b>
                  <span style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 12 }}>{t.cameraHint}</span>
                  <span className="button secondary sm" style={{ pointerEvents: 'none' }}>{t.browseFiles}</span>
                  <small style={{ color: 'var(--ink-400)', fontSize: 10, marginTop: 16 }}>{t.supportedFormats}</small>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <b style={{ display: 'block', fontSize: 13, marginBottom: 14 }}>{t.sampleInfo}</b>
            <div className="form-field-group">
              <label className="field-label">{t.sampleType} *
                <select className="field-input" value={sampleType} onChange={e=>setSampleType(e.target.value)}>
                  <option value="Silage">{locTerm('Silage')}</option>
                  <option value="Feed">{locTerm('Feed')}</option>
                </select>
              </label>
              <label className="field-label">{t.feedType}
                <select className="field-input" value={feedType} onChange={e=>setFeedType(e.target.value)}>
                  <option value="Maize Silage">{locTerm('Maize Silage')}</option>
                  <option value="Grass Silage">{locTerm('Grass Silage')}</option>
                  <option value="Sorghum Silage">{locTerm('Sorghum Silage')}</option>
                  <option value="Cattle Feed Pellet">{locTerm('Cattle Feed Pellet')}</option>
                  <option value="Dairy Concentrate">{locTerm('Dairy Concentrate')}</option>
                </select>
              </label>
            </div>

            <div className="form-field-group">
              <label className="field-label">{t.storageDuration}
                <input type="number" className="field-input" value={storageDuration} onChange={e=>setStorageDuration(e.target.value)}/>
              </label>
              <label className="field-label">{t.storageCondition}
                <select className="field-input" value={storageCondition} onChange={e=>setStorageCondition(e.target.value)}>
                  <option value="Covered Pit">{locTerm('Covered Pit')}</option>
                  <option value="Silo Bag">{locTerm('Silo Bag')}</option>
                  <option value="Shed Covered">{locTerm('Shed Covered')}</option>
                  <option value="Open Air Stack">{locTerm('Open Air Stack')}</option>
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
                  <option value="Sweet Lactic">{locTerm('Sweet Lactic')}</option>
                  <option value="Neutral">{locTerm('Neutral')}</option>
                  <option value="Vinegar">{locTerm('Vinegar')}</option>
                  <option value="Putrid">{locTerm('Putrid')}</option>
                  <option value="Musty">{locTerm('Musty')}</option>
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
              <textarea className="field-input" rows={2} placeholder={t.notesPlaceholder} value={notes} onChange={e=>setNotes(e.target.value)}/>
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
  const { t, apiFetch, lang, loc: locTerm } = useApp()
  const [test, setTest] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/tests/${id}/detail?lang=${lang}`)
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
  }, [id, apiFetch, lang])

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: 100 }}><RefreshCw size={32} className="spin" color="#16a34a"/></div>
  if (!test) return <div className="page"><h3>{lang === 'हिंदी' ? 'नमूना विश्लेषण नहीं मिला' : 'Sample Analysis Not Found'}</h3></div>

  const score = Number(test.score ?? 84)
  const risk = test.overallStatus || test.risk || 'Good'
  const confidence = Number(test.confidence ?? 92)
  const rawMin = Number(test.confidenceInterval?.min)
  const rawMax = Number(test.confidenceInterval?.max)
  const minConf = (!isNaN(rawMin) && rawMin <= confidence) ? rawMin : Math.max(0, confidence - 4)
  const maxConf = (!isNaN(rawMax) && rawMax >= confidence) ? rawMax : Math.min(100, confidence + 4)
  const isHighRisk = risk === 'Bad' || risk === 'Warning' || score < 75

  const paramsObj = test.parameters instanceof Map ? Object.fromEntries(test.parameters) : (test.parameters || {})

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analysisSummary}</h1>
          <p>{t.sampleId}: <b style={{ color: 'var(--ink-900)' }}>{test.id || test._id}</b> · {t.batchId}: <b>{test.batchId || 'SILAGE-001'}</b></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary" onClick={() => window.print()}>
            <Download size={14}/> {t.printPdf}
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
              {locTerm(risk)}
            </span>
            <table className="score-details-table">
              <tbody>
                <tr><td>{t.screeningStatus}</td><td style={{ fontWeight: 700 }}>{locTerm(risk)}</td></tr>
                <tr><td>{t.sampleFeedType}</td><td>{locTerm(test.feedType || test.sampleType || 'Silage')}</td></tr>
                <tr><td>{t.analyzedOn}</td><td>{test.analyzedOn || (test.createdAt ? new Date(test.createdAt).toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '22 May 2026')}</td></tr>
                <tr><td>{t.modelConfidence}</td><td><b>{confidence}%</b> ({minConf} - {maxConf}% CI)</td></tr>
                <tr><td>{t.aiEngine}</td><td><span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{test.aiModelUsed || 'gemini-3.5-flash'}</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 8 }}>{t.analyzedSamplePhoto}</b>
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
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> {t.lowImpactArea}</span>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> {t.riskMarker}</span>
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
              lang === 'हिंदी' ? 'उचित लैक्टिक किण्वन दर्शाता एकसमान हरा-जैतून रंग' : 'Uniform olive-green matrix indicating lactic fermentation',
              lang === 'हिंदी' ? 'कम एरोबिक क्षय के साथ सुसंगत चारा कण वितरण' : 'Consistent forage particle distribution with low aerobic decay',
              lang === 'हिंदी' ? 'आदर्श अनुमानित नमी स्तर (60-65%)' : 'Optimal estimated moisture range (60-65%)',
              lang === 'हिंदी' ? 'कोई दृश्य फफूंद या माइकोटॉक्सिन धब्बे नहीं' : 'No visible black, white, or blue-green mycotoxin mold clusters'
            ]).map((ind, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5 }}>
                <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>{ind}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-500)', display: 'block', marginBottom: 6 }}>{t.qualityScoreRange}</b>
            <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> {t.goodQuality} (80-100)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginRight: 4 }}/> {t.caution} (50-79)</span>
              <span><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> {t.highRisk} (0-49)</span>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 10 }}>{t.aiExplanation}</b>
          <p style={{ fontSize: 12.5, color: 'var(--ink-700)', lineHeight: 1.55, marginBottom: 14 }}>
            {test.aiExplanation || (lang === 'हिंदी' ? 'दृश्य विश्लेषण में स्वस्थ संरक्षण लक्षणों के साथ सामान्य चारा मैट्रिक्स का पता चला। उचित पाचन और रूमेन स्वास्थ्य की अपेक्षा है।' : 'Visual analysis detected normal forage matrix with healthy preservation traits. Rumen fermentation is expected to proceed smoothly with balanced roughage.')}
          </p>
          {qr?.qrDataUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <img src={qr.qrDataUrl} alt="Traceability QR" style={{ width: 56, height: 56 }}/>
              <div>
                <b style={{ fontSize: 11, display: 'block', color: 'var(--ink-900)' }}>{t.qrVerification}</b>
                <small style={{ fontSize: 10, color: 'var(--ink-500)' }}>{t.traceabilityId}: {qr.traceabilityId || test.id}</small>
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
                <th>{t.paramCol}</th><th>{t.valueCol}</th><th>{t.unitCol}</th><th>{t.optimalRangeCol}</th><th>{t.screeningStatusCol}</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(paramsObj).length > 0 ? (
                Object.entries(paramsObj).map(([key, p]) => (
                  <tr key={key}>
                    <td><b>{locTerm(p.label || key.replace('_', ' ').toUpperCase())}</b></td>
                    <td><b>{p.value}</b></td>
                    <td>{p.unit || '—'}</td>
                    <td><small style={{ color: 'var(--ink-500)' }}>{p.optimalRange || locTerm('Standard')}</small></td>
                    <td><span className={`badge ${riskClass(p.status || 'Good')}`}>{locTerm(p.status || 'Good')}</span></td>
                  </tr>
                ))
              ) : (
                resultParameters.map(([name, val, unit, st]) => (
                  <tr key={name}>
                    <td><b>{locTerm(name)}</b></td><td><b>{val}</b></td><td>{unit || '—'}</td>
                    <td><small style={{ color: 'var(--ink-500)' }}>{locTerm('Standard')}</small></td>
                    <td><span className={`badge ${riskClass(st)}`}>{locTerm(st)}</span></td>
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
              <span>{t.overallRiskTier}:</span>
              <span className={`badge ${riskClass(test.mycotoxinRiskRadar?.overallRiskTier || 'Low Risk')}`}>{locTerm(test.mycotoxinRiskRadar?.overallRiskTier || 'Low Risk')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.aflatoxinIndex}:</span><b>{test.mycotoxinRiskRadar?.aflatoxinRiskScore || 15}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.vomitoxinIndex}:</span><b>{test.mycotoxinRiskRadar?.vomitoxinRiskScore || 10}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.zearalenoneIndex}:</span><b>{test.mycotoxinRiskRadar?.zearalenoneRiskScore || 12}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.moldPercentage}:</span><b>{test.mycotoxinRiskRadar?.calculatedFactors?.moldPercentage || 1.2}%</b>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>{t.costQuality}</b>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span>{t.dailyLoss}:</span>
              <b style={{ color: test.costOfPoorQuality?.dailyLossInr > 0 ? '#ef4444' : '#16a34a' }}>
                ₹{test.costOfPoorQuality?.dailyLossInr || 0} / {lang === 'हिंदी' ? 'दिन' : 'day'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.milkDropPenalty}:</span>
              <b>{test.costOfPoorQuality?.milkDropLitersPerCow || 0} L / {lang === 'हिंदी' ? 'गाय / दिन' : 'cow / day'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.vetCostRisk}:</span>
              <b>₹{test.costOfPoorQuality?.vetCostRiskInr || 0}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{t.estimatedSpoilage}:</span>
              <b>{test.costOfPoorQuality?.estimatedSpoilagePct || 1.5}%</b>
            </div>
          </div>
        </div>
      </div>

      {/* ── Predictive Spoilage Timeline ── */}
      {(() => {
        const moisture = Number(paramsObj?.moisture?.value || 64)
        const temp = Number(test.tempC || 32)
        const safeDays = score >= 80 ? (temp > 32 ? 6 : 9) : score >= 60 ? (temp > 32 ? 3 : 5) : 2
        const isUrgent = safeDays <= 3

        return (
          <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${isUrgent ? '#ef4444' : '#16a34a'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Timer size={16} color={isUrgent ? '#ef4444' : '#16a34a'}/>
                <b style={{ fontSize: 14 }}>{t.spoilageTimeline}</b>
              </div>
              <span className={`badge ${isUrgent ? 'high' : 'good'}`}>
                {isUrgent ? t.urgentFeed.replace('{days}', safeDays) : t.safeWindow.replace('{days}', safeDays)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: '0 0 14px' }}>
              {t.spoilageBasedOn.replace('{moisture}', moisture).replace('{temp}', temp)}
            </p>

            {/* Visual Timeline Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: '#16a34a', display: 'block' }}>{t.day12}</b>
                <span style={{ fontSize: 10, color: 'var(--ink-600)' }}>{t.day12Desc}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: safeDays > 2 ? '#f0fdf4' : '#fffbeb', border: `1px solid ${safeDays > 2 ? '#bbf7d0' : '#fde68a'}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: safeDays > 2 ? '#16a34a' : '#d97706', display: 'block' }}>{t.day34}</b>
                <span style={{ fontSize: 10, color: 'var(--ink-600)' }}>{t.day34Desc}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: safeDays > 4 ? '#fffbeb' : '#fff1f2', border: `1px solid ${safeDays > 4 ? '#fde68a' : '#fecaca'}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: safeDays > 4 ? '#d97706' : '#dc2626', display: 'block' }}>{t.day57}</b>
                <span style={{ fontSize: 10, color: 'var(--ink-600)' }}>{t.day57Desc}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: '#fff1f2', border: '1px solid #fecaca', textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: '#dc2626', display: 'block' }}>{t.day8Plus}</b>
                <span style={{ fontSize: 10, color: 'var(--ink-600)' }}>{t.day8PlusDesc}</span>
              </div>
            </div>

            <div style={{ fontSize: 11.5, background: '#f8fafc', padding: '8px 12px', borderRadius: 6, color: 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={13} color="#f59e0b"/>
              <span><b>{t.actionTip}:</b> {safeDays <= 3 ? t.spoilageActionUrgent : t.spoilageActionSafe}</span>
            </div>
          </div>
        )
      })()}

      {/* ── Ration Optimizer ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Salad size={16} color="#0ea5e9"/>
            <b style={{ fontSize: 14 }}>{t.rationOptimizer}</b>
          </div>
          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: 99, border: '1px solid #bbf7d0' }}>
            {t.potentialSavings}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-600)', margin: '0 0 12px' }}>
          {t.rationOptDesc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-900)', display: 'block', marginBottom: 4 }}>{t.mustardCake}</b>
            <p style={{ fontSize: 11, color: 'var(--ink-600)', margin: '0 0 6px' }}>{t.mustardCakeDesc}</p>
            <small style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>{t.mustardCakeSave}</small>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-900)', display: 'block', marginBottom: 4 }}>{t.greenBerseem}</b>
            <p style={{ fontSize: 11, color: 'var(--ink-600)', margin: '0 0 6px' }}>{t.greenBerseemDesc}</p>
            <small style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>{t.greenBerseemGain}</small>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid var(--border-light)' }}>
            <b style={{ fontSize: 12, color: 'var(--ink-900)', display: 'block', marginBottom: 4 }}>{t.minBuffer}</b>
            <p style={{ fontSize: 11, color: 'var(--ink-600)', margin: '0 0 6px' }}>{t.minBufferDesc}</p>
            <small style={{ fontSize: 10, color: '#0ea5e9', fontWeight: 700 }}>{t.minBufferBenefit}</small>
          </div>
        </div>
      </div>

      <div className="card">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>{t.advisories}</b>
        <div style={{ display: 'grid', gap: 8 }}>
          {(test.advisories && test.advisories.length > 0 ? test.advisories : [
            lang === 'हिंदी' ? 'द्वितीयक एरोबिक क्षय को रोकने के लिए दैनिक ट्रेंच फीडिंग गहराई (15-20 सेमी) बनाए रखें।' : 'Maintain daily trench feeding depth (15-20cm) to prevent secondary aerobic spoilage.',
            lang === 'हिंदी' ? 'सुनिश्चित करें कि टीएमआर राशन पर्याप्त सूखे चारे और ऊर्जा को संतुलित करता है।' : 'Ensure Total Mixed Ration balances energy with adequate dry matter intake.'
          ]).map((adv, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12.5, borderLeft: '3px solid #16a34a' }}>
              {adv}
            </div>
          ))}
        </div>
        {test.recommendations && (
          <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-700)', fontWeight: 600 }}>
            {t.farmerRecommendation}: {test.recommendations}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 5: MY BATCHES PAGE ─────────────────── */
function Batches() {
  const navigate = useNavigate()
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
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
    if (!batchIdInput.trim()) return toast(t.batchIdRequired || 'Please provide a Batch ID', 'error')
    try {
      await apiFetch('/api/batches', {
        method: 'POST',
        body: JSON.stringify({ id: batchIdInput.trim(), type: batchType, feedType, notes })
      })
      setModal(false)
      setBatchIdInput('')
      load()
      toast(t.batchCreatedToast || 'New batch created successfully', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  const list = batches.length > 0 ? batches : mockBatches

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.myBatches}</h1>
          <p>{t.manageBatchesDesc}</p>
        </div>
        <button className="button primary" onClick={() => setModal(true)}>
          <Plus size={14}/> {t.addNewBatch}
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.batchIdCol}</th><th>{t.typeCol}</th><th>{t.feedTypeCol}</th><th>{t.createdOnCol}</th><th>{t.analysesCol}</th><th>{t.avgScoreCol}</th><th>{t.statusCol}</th><th>{t.actionCol}</th>
            </tr>
          </thead>
          <tbody>
            {list.map(b => {
              const bId = b.id || b._id
              return (
                <tr key={bId}>
                  <td><b>{b.id}</b></td>
                  <td>{locTerm(b.type)}</td>
                  <td>{locTerm(b.feedType)}</td>
                  <td>{b.createdOn || (b.createdAt ? new Date(b.createdAt).toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '20 May 2026')}</td>
                  <td>{b.analysesCount || b.analyses || 4}</td>
                  <td><b>{b.averageScore || 82}/100</b></td>
                  <td><span className="badge good">{locTerm(b.status || 'Active')}</span></td>
                  <td>
                    <button className="button secondary sm" onClick={() => navigate(`/batches/${b.id || b._id}`)}>
                      <Eye size={12}/> {t.view}
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
              <h3>{t.createBatchModal}</h3>
              <button className="button secondary sm" onClick={() => setModal(false)}><X size={14}/></button>
            </div>
            <div className="modal-body">
              <label className="field-label" style={{ marginBottom: 12 }}>{t.batchIdCol}
                <input className="field-input" placeholder="e.g. SILAGE-004" value={batchIdInput} onChange={e=>setBatchIdInput(e.target.value)}/>
              </label>
              <label className="field-label" style={{ marginBottom: 12 }}>{t.typeCol}
                <select className="field-input" value={batchType} onChange={e=>setBatchType(e.target.value)}>
                  <option value="Silage">{locTerm('Silage')}</option>
                  <option value="Feed">{locTerm('Feed')}</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 12 }}>{t.feedTypeCol}
                <select className="field-input" value={feedType} onChange={e=>setFeedType(e.target.value)}>
                  <option value="Maize Silage">{locTerm('Maize Silage')}</option>
                  <option value="Grass Silage">{locTerm('Grass Silage')}</option>
                  <option value="Cattle Feed Pellet">{locTerm('Cattle Feed Pellet')}</option>
                  <option value="Dairy Concentrate">{locTerm('Dairy Concentrate')}</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 16 }}>{t.notesOpt}
                <textarea className="field-input" rows={2} placeholder={t.batchNotesPlaceholder} value={notes} onChange={e=>setNotes(e.target.value)}/>
              </label>
              <button className="button primary full" onClick={create}>{t.saveBatch}</button>
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
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
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
      toast(t.milkYieldLoggedToast || 'Milk yield logged successfully for this batch!', 'success')
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
          <p>{t.batchIdCol}: <b style={{ color: 'var(--ink-900)' }}>{batch.id}</b> · {locTerm(batch.feedType)}</p>
        </div>
        <button className="button secondary" onClick={() => navigate('/batches')}>
          {t.backToBatches}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>{t.batchInfo}</b>
          <table className="score-details-table">
            <tbody>
              <tr><td>{t.typeCol}</td><td>{locTerm(batch.type)}</td></tr>
              <tr><td>{t.feedTypeCol}</td><td>{locTerm(batch.feedType)}</td></tr>
              <tr><td>{t.storageCondition}</td><td>{locTerm(batch.storage || 'Covered Pit')}</td></tr>
              <tr><td>{t.analysesCol}</td><td>{tests.length || 4}</td></tr>
              <tr><td>{t.avgScoreCol}</td><td><b>{batch.averageScore || 82}/100</b></td></tr>
              <tr><td>{t.statusCol}</td><td><span className="badge good">{locTerm(batch.status || 'Active')}</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 10 }}>{t.quickMilkLogger}</b>
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
            {t.quickMilkTip}
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)' }}>
          <b>{t.batchAnal}</b>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>{t.sampleId}</th><th>{t.analyzedOn}</th><th>{t.score}</th><th>{t.risk}</th><th>{t.action}</th></tr>
          </thead>
          <tbody>
            {tests.map(t2 => (
              <tr key={t2.id || t2._id}>
                <td><b>{t2.id || t2._id}</b></td>
                <td>{t2.analyzedOn || (lang === 'हिंदी' ? '22 मई 2026, 10:30 AM' : '22 May 2026, 10:30 AM')}</td>
                <td><b>{t2.score || 87}</b></td>
                <td><span className={`badge ${riskClass(t2.overallStatus || t2.risk)}`}>{locTerm(t2.overallStatus || t2.risk || 'Good')}</span></td>
                <td>
                  <Link to={`/analysis/${t2.id || t2._id}`} className="button secondary sm"><Eye size={12}/> {t.viewReport}</Link>
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
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
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
      toast(t.yieldLoggedToast || 'Milk yield logged successfully!', 'success')
      setNotes('')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/milk-yield/${id}`, { method: 'DELETE' })
      toast(t.logDeletedToast || 'Log entry deleted', 'info')
      load()
    } catch (err) { toast(err.message, 'error') }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.milkYieldTitle}</h1>
          <p>{t.milkYieldSubtitle}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14 }}>{t.logYield}</b>
          <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
            <label className="field-label">{t.batchId}
              <select className="field-input" value={batchId} onChange={e=>setBatchId(e.target.value)}>
                <option value="SILAGE-001">SILAGE-001 ({locTerm('Maize Silage')})</option>
                <option value="SILAGE-002">SILAGE-002 ({locTerm('Grass Silage')})</option>
                <option value="SILAGE-003">SILAGE-003 ({locTerm('Open Air Stack')})</option>
                <option value="FEED-001">FEED-001 ({locTerm('Cattle Feed Pellet')})</option>
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
              <input className="field-input" placeholder={lang === 'हिंदी' ? 'उदा. दोपहर का दूध, गर्मी' : 'e.g. Afternoon milking, high heat'} value={notes} onChange={e=>setNotes(e.target.value)}/>
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
              <tr><th>{t.yieldDate}</th><th>{t.batchId}</th><th>Total (L)</th><th>{t.cowCount}</th><th>{t.avgPerCow}</th><th>Notes</th><th>{t.actionCol}</th></tr>
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
  const { t, apiFetch, lang, loc: locTerm } = useApp()
  const [tests, setTests] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch(`/api/tests?lang=${lang}`).then(setTests).catch(console.error)
  }, [apiFetch, lang])

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
          <p>{t.historySubtitle}</p>
        </div>
        <button className="button secondary" onClick={exportCSV}>
          <Download size={14}/> {t.exportCsv}
        </button>
      </div>

      <div className="table-container">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', top: 12, left: 12 }}/>
            <input className="field-input sm full" style={{ paddingLeft: 34 }} placeholder={t.searchPlaceholder} value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="field-input sm" style={{ width: 130 }} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            <option value="All">{t.allTypes}</option>
            <option value="Silage">{locTerm('Silage')}</option>
            <option value="Feed">{locTerm('Feed')}</option>
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
              const dateStr = r.analyzedOn || (r.createdAt ? new Date(r.createdAt).toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '22 May 2026')
              return (
                <tr key={id}>
                  <td><b>{id}</b></td>
                  <td>{r.batchId || 'SILAGE-001'}</td>
                  <td>{locTerm(r.sampleType || r.type || 'Silage')}</td>
                  <td>{dateStr}</td>
                  <td><b>{r.score ?? 87}</b></td>
                  <td><span className={`badge ${riskClass(risk)}`}>{locTerm(risk)}</span></td>
                  <td>
                    <Link to={`/analysis/${id}`} className="button secondary sm"><Eye size={12}/> {t.view}</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--ink-500)' }}>
          <span>{t.showingResults.replace('{shown}', Math.min(8, filtered.length)).replace('{total}', filtered.length)}</span>
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
  const isHindi = lang === 'हिंदी'
  const [messages, setMessages] = useState([
    { from: 'bot', text: isHindi ? '## 🌾 नमस्ते किसान भाई!\n\nमैं आपका **SmartFeed AI सहायक** हूँ। साइलेज गुणवत्ता, नमी, टीएमआर राशन संतुलन, फफूंद रोकथाम, या दूध उत्पादन के बारे में कुछ भी पूछें।' : '## 🌾 Hello, Dairy Farmer!\n\nI am your **SmartFeed AI Agronomist & Animal Nutritionist**. Ask me anything about feed quality, silage moisture (60–68%), pH, mycotoxin prevention, ration balancing, or herd health.' }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [ttsActive, setTtsActive] = useState(null)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  // Stop any active TTS on unmount
  useEffect(() => () => { if (window.speechSynthesis) window.speechSynthesis.cancel() }, [])

  const send = async (txt) => {
    const q = txt || input
    if (!q.trim()) return
    setInput('')
    setMessages(m => [...m, { from: 'user', text: q, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
    setTyping(true)

    try {
      const data = await apiFetch('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: q, history: messages.map(m => ({ from: m.from, text: m.text })), language: lang })
      })
      setMessages(m => [...m, { from: 'bot', text: data.text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
    } catch (e) {
      setMessages(m => [...m, { from: 'bot', text: isHindi ? '⚠️ AI सहायक से कनेक्शन में त्रुटि। कृपया पुनः प्रयास करें।' : '⚠️ Error connecting to Gemini assistant. Please try again.', time: 'Now' }])
    } finally {
      setTyping(false)
    }
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert(isHindi ? 'आपका ब्राउज़र वॉयस इनपुट को सपोर्ट नहीं करता।' : 'Your browser does not support voice input.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setIsRecording(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
    }
    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)
    recognition.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  const speakMessage = (text, msgIdx) => {
    if (!window.speechSynthesis) return
    if (ttsActive === msgIdx) {
      window.speechSynthesis.cancel()
      setTtsActive(null)
      return
    }
    window.speechSynthesis.cancel()
    const stripped = text.replace(/#{1,6}\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[-*]\s/g, '').substring(0, 800)
    const utterance = new SpeechSynthesisUtterance(stripped)
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setTtsActive(null)
    utterance.onerror = () => setTtsActive(null)
    window.speechSynthesis.speak(utterance)
    setTtsActive(msgIdx)
  }

  const quickPrompts = isHindi
    ? ['साइलेज में फफूंद लगे तो क्या करें?', 'मक्का साइलेज की आदर्श नमी?', 'दूध उत्पादन कैसे बढ़ाएं?', 'TMR राशन कैसे संतुलित करें?']
    : ['How to fix silage mold contamination?', 'Ideal moisture for maize silage?', 'How to increase milk yield with TMR?', 'What does a score of 62 mean?']

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.aiAssistant}</h1>
          <p>{t.aiAssistantSubtitle}</p>
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`chat-message-bubble ${m.from === 'bot' ? 'bot-markdown' : ''}`}>
                  {m.from === 'bot'
                    ? <ReactMarkdown>{m.text}</ReactMarkdown>
                    : <span>{m.text}</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <small style={{ fontSize: 10, color: 'var(--ink-400)', textAlign: m.from === 'user' ? 'right' : 'left' }}>
                    {m.from === 'bot' ? 'SmartFeed AI · ' : (lang === 'हिंदी' ? 'आप · ' : 'You · ')}{m.time || (lang === 'हिंदी' ? 'अभी' : 'Now')}
                  </small>
                  {m.from === 'bot' && window.speechSynthesis && (
                    <button
                      onClick={() => speakMessage(m.text, i)}
                      title={ttsActive === i ? (isHindi ? 'बंद करें' : 'Stop') : (isHindi ? 'सुनें' : 'Listen')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: ttsActive === i ? '#16a34a' : 'var(--ink-400)', borderRadius: 4, transition: '0.15s' }}
                    >
                      <Volume2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-message-row bot">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eafaf0', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                <Bot size={18}/>
              </div>
              <div className="chat-message-bubble">
                <span className="spin" style={{ display: 'inline-block' }}>◓</span> {t.consultingGemini}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="chat-input-toolbar">
          <div className="quick-prompt-chips">
            {quickPrompts.map(prompt => (
              <button key={prompt} type="button" className="chip-btn" onClick={() => send(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="chat-bar-inner">
            <input
              className="field-input full"
              placeholder={t.askInVoice}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button
              type="button"
              className={`button ${isRecording ? 'primary' : 'secondary'}`}
              style={{ padding: '0 12px', position: 'relative' }}
              onClick={isRecording ? stopVoice : startVoice}
              title={isRecording ? (isHindi ? 'रोकें' : 'Stop Recording') : (isHindi ? 'बोलें' : 'Voice Input')}
            >
              {isRecording
                ? <><MicOff size={15} style={{ animation: 'pulse 1s infinite' }}/></>
                : <Mic size={15}/>
              }
            </button>
            <button className="button primary" onClick={() => send()}>
              <Send size={15}/>
            </button>
          </div>
          {isRecording && (
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
              <span style={{ width: 8, height: 8, background: '#dc2626', borderRadius: '50%', animation: 'pulse 1s infinite', display: 'inline-block' }}/>
              {t.listeningSpeakNow}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN 9: REPORTS PAGE ─────────────────── */
function Reports() {
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
  const [tab, setTab] = useState('Sample Reports')
  const [reports, setReports] = useState([])
  const [modal, setModal] = useState(false)
  const [refName, setRefName] = useState('SF-2026-1256')

  const load = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/reports?lang=${lang}`)
      if (Array.isArray(data)) setReports(data)
    } catch (e) { console.error(e) }
  }, [apiFetch, lang])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ type: tab === 'Sample Reports' ? 'Sample Report' : 'Batch Report', ref: refName, language: lang })
      })
      setModal(false)
      load()
      toast(t.reportGeneratedToast || 'Report generated successfully with Gemini summary!', 'success')
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
          <p>{t.reportsSubtitle}</p>
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
              {tb === 'Sample Reports' ? t.sampleReportsTab : t.batchReportsTab}
            </button>
          ))}
        </div>

        <table className="data-table">
          <thead>
            <tr><th>{t.reportIdCol}</th><th>{t.typeCol}</th><th>{t.dateCol}</th><th>{t.refSampleBatchId}</th><th>{t.summaryCol}</th><th>{t.actionCol}</th></tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id}>
                <td><b>{r.id}</b></td>
                <td>{locTerm(r.type)}</td>
                <td>{r.date || (lang === 'हिंदी' ? '22 मई 2026, 10:30 AM' : '22 May 2026, 10:30 AM')}</td>
                <td><b>{r.ref || 'SF-2026-1256'}</b></td>
                <td><small style={{ color: 'var(--ink-700)' }}>{r.summary ? r.summary.slice(0, 75) + '...' : (lang === 'हिंदी' ? 'सत्यापित गुणवत्ता पैरामीटर' : 'Verified quality parameters')}</small></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="button secondary sm" onClick={() => exportReportCSV(r)}>
                      <Download size={13}/> CSV
                    </button>
                    <button className="button secondary sm" onClick={() => window.print()}>
                      {t.printPdf}
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
              <h3>{t.generateNewReportModal}</h3>
              <button className="button secondary sm" onClick={() => setModal(false)}><X size={14}/></button>
            </div>
            <div className="modal-body">
              <label className="field-label" style={{ marginBottom: 12 }}>{t.reportTypeLabel}
                <select className="field-input" value={tab} onChange={e=>setTab(e.target.value)}>
                  <option value="Sample Reports">{t.sampleReportsTab}</option>
                  <option value="Batch Reports">{t.batchReportsTab}</option>
                </select>
              </label>
              <label className="field-label" style={{ marginBottom: 16 }}>{t.refSampleBatchId}
                <input className="field-input" value={refName} onChange={e=>setRefName(e.target.value)}/>
              </label>
              <button className="button primary full" onClick={generate}>{t.generateReport}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────── SCREEN: SILAGE COACH PAGE ─────────────────── */
function SilageCoach() {
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
  const [stages, setStages] = useState([])
  const [steps, setSteps] = useState([])

  const load = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/silage-coach?batchId=SILAGE-001&lang=${lang}`)
      setStages(data.stages || [])
      setSteps(data.steps || [])
    } catch (e) { console.error(e) }
  }, [apiFetch, lang])

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
    toast(t.milestoneUpdatedToast ? t.milestoneUpdatedToast.replace('{num}', stageNum) : `Stage ${stageNum} milestone updated`, 'success')
  }

  const completedCount = steps.filter(s => s.completed).length
  const progressPct = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.coachTitle}</h1>
          <p>{t.coachSubtitle}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <b>{t.coachProgress.replace('{pct}', progressPct)}</b>
          <span className="badge good">{t.stagesVerified.replace('{count}', completedCount).replace('{total}', stages.length)}</span>
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
                <span className={`badge ${isDone ? 'good' : 'caution'}`}>{isDone ? t.completedBadge : t.inProgressBadge}</span>
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
  const { t, apiFetch, loc: locTerm } = useApp()
  const [analytics, setAnalytics] = useState(null)
  useEffect(() => { apiFetch('/api/analytics').then(setAnalytics).catch(console.error) }, [apiFetch])

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analytics}</h1>
          <p>{t.analyticsSubtitle}</p>
        </div>
      </div>

      <div className="dashboard-stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-metric-card">
          <small>{t.totalAssessedBatches}</small>
          <div className="stat-metric-value-row"><b>{analytics?.activeBatches || 5}</b></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.avgFeedHealthIndex}</small>
          <div className="stat-metric-value-row"><b>{analytics?.averageScore || 81} / 100</b></div>
        </div>
        <div className="stat-metric-card">
          <small>{t.safeFeedingRatio}</small>
          <div className="stat-metric-value-row"><b style={{ color: '#16a34a' }}>{Math.round(((analytics?.riskDistribution?.Good || 4) / (analytics?.totalTests || 6)) * 100)}%</b></div>
        </div>
      </div>

      <div className="card">
        <b style={{ display: 'block', fontSize: 14, marginBottom: 12 }}>{t.feedTypeDistribution}</b>
        <div style={{ display: 'grid', gap: 10 }}>
          {Object.entries(analytics?.feedTypeDistribution || { 'Maize Silage': 3, 'Cattle Feed Pellet': 1, 'Grass Silage': 1, 'Dairy Concentrate': 1 }).map(([ft, count]) => (
            <div key={ft}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>{locTerm(ft)}</span>
                <b>{count} {lang === 'हिंदी' ? 'नमूने' : 'samples'}</b>
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
  const { t, user, lang } = useApp()
  const isHindi = lang === 'हिंदी'
  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>{t.profileTitle}</h1><p>{t.profileSubtitle}</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div className="topbar-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{user?.name ? user.name[0] : 'R'}</div>
          <div>
            <b style={{ fontSize: 18 }}>{user?.name || (isHindi ? 'किसान राज' : 'Farmer Raj')}</b>
            <small style={{ display: 'block', color: 'var(--ink-500)' }}>{user?.email || 'raj@farm.com'} · {user?.location || (isHindi ? 'आनंद, गुजरात' : 'Anand, Gujarat')}</small>
          </div>
        </div>
        <div className="form-field-group">
          <label className="field-label">{t.fullName}<input className="field-input" defaultValue={user?.name || (isHindi ? 'किसान राज' : 'Farmer Raj')}/></label>
          <label className="field-label">{t.phone}<input className="field-input" defaultValue={user?.phone || '+91 98765 43210'}/></label>
        </div>
        <div className="form-field-group">
          <label className="field-label">{t.location}<input className="field-input" defaultValue={user?.location || (isHindi ? 'आनंद, गुजरात' : 'Anand, Gujarat')}/></label>
          <label className="field-label">{t.dairyHerdSize}<input className="field-input" defaultValue="24"/></label>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const { t, settings, setSetting, lang, switchLang } = useApp()
  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>{t.settings}</h1><p>{t.settingsSubtitle}</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600, display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>{t.darkMode}</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>{t.darkModeDesc}</small></div>
          <input type="checkbox" checked={settings.darkMode} onChange={e => setSetting('darkMode', e.target.checked)}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>{t.interfaceLang}</b><small style={{ display: 'block', color: 'var(--ink-500)' }}>{t.interfaceLangDesc}</small></div>
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
  const { t, login } = useApp()
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-canvas)' }}>
      <div className="card" style={{ width: 360, textAlign: 'center' }}>
        <div className="brand-logo-icon" style={{ margin: '0 auto 12px' }}><Leaf size={20}/></div>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>SmartFeed AI</h2>
        <p style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 20 }}>{t.loginTagline}</p>
        <button className="button primary full lg" onClick={() => { login({ name: 'Farmer Raj', email: 'raj@farm.com' }, 'demo-token'); navigate('/dashboard'); }}>
          {t.signInDemo}
        </button>
      </div>
    </div>
  )
}

export default App

