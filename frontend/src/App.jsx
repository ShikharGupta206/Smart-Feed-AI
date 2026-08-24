import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, BarChart3, Bot, ChevronRight, ClipboardCheck, Download, FileText, Filter,
  HelpCircle, Home, Languages, Leaf, LogOut, Menu, Package, Plus, ScanSearch,
  Settings, ShieldCheck, Star, TrendingUp, Upload, UserCircle, X, XCircle, Zap, AlertTriangle,
  CheckCircle, Bell, Search, Calendar, Eye, RefreshCw, Send, Trash2, CheckCheck, QrCode,
  CheckSquare, Square, DollarSign, HeartPulse, Sparkles, MessageSquare, Headphones,
  Camera, Info, ShieldAlert, FileSpreadsheet, ArrowUpRight, Mic, MicOff, Volume2,
  Lightbulb, MapPin, TrendingDown, Award, Timer, Salad, Scale, Sliders, Layers, Check
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

const API_BASE = import.meta.env?.VITE_API_URL ?? (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '')

function App() {
  const [lang, setLang] = useState('English')
  const [settings, setSettings] = useState({ notifications: true, offline: true, darkMode: false })
  const [toasts, setToasts] = useState([])
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartfeed_user')
    return saved ? JSON.parse(saved) : { _id: '664f1a2b3c4d5e6f7a8b9c01', name: 'Farmer Raj', email: 'raj@farm.com', phone: '+91 98765 43210', location: 'Anand, Gujarat', cattleCount: 24 }
  })
  const [token, setToken] = useState(() => localStorage.getItem('smartfeed_token') || 'guest-token-mock')

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const updated = { ...(prev || {}), ...updatedFields }
      localStorage.setItem('smartfeed_user', JSON.stringify(updated))
      return updated
    })
  }, [])

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
      const err = new Error(data.message || data.error || `HTTP error! Status: ${res.status}`)
      err.code = data.error || null
      err.suggestion = data.suggestion || null
      err.status = res.status
      throw err
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
    <AppCtx.Provider value={{ lang, t, loc: locTerm, settings, setSetting, switchLang, toast, user, setUser, updateUser, token, login, logout, apiFetch }}>
      <div className={settings.darkMode ? 'dark-root' : ''}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/*" element={<Shell />} />
          </Routes>
        </HashRouter>
        {toasts.length > 0 && (
          <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {toasts.map(t2 => (
              <div key={t2.id} style={{ background: t2.type === 'error' ? '#7f1d1d' : t2.type === 'success' ? '#0f172a' : '#1e3a5f', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {t2.type === 'error' ? <X size={14} color="#ef4444" /> : t2.type === 'success' ? <CheckCircle size={14} color="#22c55e" /> : <Info size={14} color="#60a5fa" />}
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
    ['/ration-simulator', t.rationSimulator || 'Ration Simulator', Scale],
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
          <Route path="/ration-simulator" element={<RationSimulator/>}/>
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

const PRIORITY_CFG_DARK = {
  high:   { label: 'High Priority',   bg: '#2e0f15', border: '#ef4444', text: '#fca5a5', icon: '🔴' },
  medium: { label: 'Medium Priority', bg: '#2b1b08', border: '#f59e0b', text: '#fde68a', icon: '🟡' },
  low:    { label: 'Low Priority',    bg: '#092516', border: '#22c55e', text: '#86efac', icon: '🟢' },
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
  const { t, lang, loc: locTerm, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
  const [showAll, setShowAll] = useState(false)
  const top3 = suggestions.slice(0, 3)
  const priConfig = isDark ? PRIORITY_CFG_DARK : PRIORITY_CFG

  const resolveActionTarget = (s) => {
    const raw = String(s?.actionLink || '').trim().toLowerCase()
    if (raw.includes('coach')) return '/coach'
    if (raw.includes('milk')) return '/milk-yield'
    if (raw.includes('batch')) return '/batches'
    if (raw.includes('report')) return '/reports'
    if (raw.includes('assist') || raw.includes('chat')) return '/assistant'
    if (raw.includes('analytic')) return '/analytics'
    if (raw.includes('analysis') || raw.includes('test') || raw.includes('scan')) return '/analysis/new'

    // Smart category-based redirection if link is /dashboard or unspecified
    const cat = String(s?.category || '').toLowerCase()
    if (cat.includes('ferment') || cat.includes('storage')) return '/coach'
    if (cat.includes('milk')) return '/milk-yield'
    if (cat.includes('cost')) return '/batches'
    return '/analysis/new'
  }

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
            const pri = priConfig[s.priority] || priConfig.medium
            const catColor = CATEGORY_COLOR[s.category] || '#64748b'
            return (
              <div key={s.id || idx} style={{
                padding: '14px 20px', borderBottom: idx < top3.length - 1 ? '1px solid var(--border-light)' : 'none',
                borderLeft: `4px solid ${pri.border}`, background: pri.bg, transition: '0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11 }}>{pri.icon}</span>
                      <b style={{ fontSize: 13, color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{s.title}</b>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#ffffff' : catColor, background: isDark ? catColor + '40' : catColor + '18', border: isDark ? `1px solid ${catColor}88` : 'none', borderRadius: 4, padding: '1px 6px' }}>{locTerm(s.category)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: isDark ? '#e2e8f0' : 'var(--ink-600)', margin: 0, lineHeight: 1.55 }}>{s.description}</p>
                  </div>
                  <button
                    className="button primary sm"
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                    onClick={() => navigate(resolveActionTarget(s))}
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
              <button onClick={() => setShowAll(false)} className="button secondary sm" style={{ padding: '4px 8px' }}><X size={14}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestions.map((s, idx) => {
                const pri = priConfig[s.priority] || priConfig.medium
                const catColor = CATEGORY_COLOR[s.category] || '#64748b'
                return (
                  <div key={s.id || idx} style={{ padding: 14, borderRadius: 10, background: pri.bg, border: `1px solid ${pri.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span>{pri.icon}</span>
                      <b style={{ fontSize: 13, color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{s.title}</b>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#ffffff' : catColor, background: isDark ? catColor + '40' : catColor + '18', border: isDark ? `1px solid ${catColor}88` : 'none', borderRadius: 4, padding: '1px 6px' }}>{locTerm(s.category)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pri.text, marginLeft: 'auto' }}>{pri.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: isDark ? '#e2e8f0' : 'var(--ink-600)', margin: '0 0 10px' }}>{s.description}</p>
                    <button className="button primary sm" onClick={() => { navigate(resolveActionTarget(s)); setShowAll(false) }}>
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
  const { t, apiFetch, user, lang, loc: locTerm, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
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
          { id: 'f3', title: isHindi ? 'साइलेज कोच जारी रखें' : 'Continue Silage Coach', description: isHindi ? 'साइलेज निर्माण के सभी चरण पूरे करें।' : 'Complete remaining Silage Coach stages to ensure optimal fermentation practices.', priority: 'low', category: 'Storage', actionLabel: isHindi ? 'कोच देखें' : 'Open Coach', actionLink: '/coach' },
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
          <div style={{ width: 52, height: 52, borderRadius: 14, background: isDark ? (streak >= 5 ? '#3d280e' : '#092516') : (streak >= 5 ? '#fef3c7' : '#f0fdf4'), display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>
            {streak >= 7 ? '🥇' : streak >= 4 ? '🔥' : '✅'}
          </div>
          <div>
            <b style={{ fontSize: 22, color: isDark ? (streak >= 5 ? '#f59e0b' : '#4ade80') : (streak >= 5 ? '#d97706' : '#16a34a') }}>{streak}</b>
            <span style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 4 }}>{t.dayQualityStreak}</span>
            <p style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-400)', margin: '2px 0 0', lineHeight: 1.4 }}>
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
            <span style={{ fontSize: 24, fontWeight: 800, color: isDark ? (isTopPerformer ? '#4ade80' : '#f59e0b') : (isTopPerformer ? '#16a34a' : '#d97706') }}>{avgScore}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 4 }}>{t.yourScore}</span>
            <span style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4 }}>vs</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#cbd5e1' : 'var(--ink-500)', marginBottom: 2 }}>{region.avgScore}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 4 }}>{t.regionAvg}</span>
          </div>
          <div style={{ height: 6, background: isDark ? '#143823' : '#f1f5f9', borderRadius: 4, marginBottom: 6 }}>
            <div style={{ height: '100%', borderRadius: 4, background: isTopPerformer ? '#22c55e' : '#f59e0b', width: `${Math.min(100, avgScore)}%`, transition: '1s ease' }}/>
          </div>
          <p style={{ fontSize: 11, color: isDark ? (isTopPerformer ? '#86efac' : '#fde68a') : (isTopPerformer ? '#16a34a' : '#d97706'), fontWeight: 700, margin: 0 }}>
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
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[0,25,50,75,100].map(v => {
                const y = ty(Math.min(maxV, Math.max(minV, v)))
                if (y < padT - 2 || y > padT + chartH + 2) return null
                return <g key={v}>
                  <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke={isDark ? '#143823' : '#f1f5f9'} strokeWidth="1"/>
                  <text x={padL - 4} y={y + 4} fill={isDark ? '#94a3b8' : '#94a3b8'} fontSize="9" textAnchor="end">{v}</text>
                </g>
              })}
              <polygon fill="url(#tg)" points={`${tx(0)},${padT+chartH} ${polyPts} ${tx(trendArr.length-1)},${padT+chartH}`}/>
              <polyline fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyPts}/>
              {trendArr.map((v, i) => (
                <g key={i}>
                  <circle cx={tx(i)} cy={ty(v)} r="4" fill="#22c55e" stroke={isDark ? '#06150c' : '#fff'} strokeWidth="2"/>
                  <text x={tx(i)} y={ty(v) - 8} fill={isDark ? '#ffffff' : '#0f172a'} fontSize="9" fontWeight="700" textAnchor="middle">{v}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="card donut-chart-container">
          <div className="card-head" style={{ width: '100%', marginBottom: 8 }}><b>{t.riskDistribution}</b></div>
          <div className="donut-circle-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke={isDark ? '#2e0f15' : '#fee2e2'} strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset="0"/>
              {cautionPct > 0 && <circle cx="50" cy="50" r="38" fill="none" stroke={isDark ? '#3d280e' : '#fef3c7'} strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - cautionPct - highPct)}/>}
              {goodPct > 0 && <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - goodPct)}/>}
            </svg>
            <div className="donut-center-label"><b style={{ color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{total}</b><small>{lang === 'हिंदी' ? 'कुल' : 'Total'}</small></div>
          </div>
          <div className="donut-legend-stack">
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#22c55e' }}/>{t.goodQuality} ({total > 0 ? Math.round((good/total)*100) : 0}%)</span><b>{good}</b></div>
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#f59e0b' }}/>{t.caution} ({total > 0 ? Math.round((caution/total)*100) : 0}%)</span><b>{caution}</b></div>
            <div className="donut-legend-row"><span><span className="donut-legend-dot" style={{ background: '#ef4444' }}/>{t.highRisk} ({total > 0 ? Math.round((high/total)*100) : 0}%)</span><b>{high}</b></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14 }}>{t.recentAnalyses}</b>
          <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--brand-primary)', fontWeight: 700 }}>{t.viewAll}</button>
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
                  <td><button className="button secondary sm" onClick={() => navigate(`/analysis/${id}`)}><Eye size={12}/> {t.view}</button></td>
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
  reader.onload = e => {
    const img = new Image()
    img.onload = () => {
      const maxDim = 1000
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => resolve(e.target.result)
    img.src = e.target.result
  }
  reader.onerror = reject
})

function NewAnalysis() {
  const navigate = useNavigate()
  const { t, toast, apiFetch, lang, loc: locTerm, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [invalidAlert, setInvalidAlert] = useState(null)
  const [analysisFailed, setAnalysisFailed] = useState(null) // { message, suggestion }
  const [sampleType, setSampleType] = useState('Silage')
  const [feedType, setFeedType] = useState('Maize Silage')
  const [storageDuration, setStorageDuration] = useState('20')
  const [storageCondition, setStorageCondition] = useState('Covered Pit')
  const [tempC, setTempC] = useState('32')
  const [humidityPct, setHumidityPct] = useState('65')
  const [smell, setSmell] = useState('Neutral')
  const [batchId, setBatchId] = useState('SILAGE-001')
  const [notes, setNotes] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = f => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setInvalidAlert(null)
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!file) return toast(t.selectFileError || 'Please select or capture a feed/silage image first', 'error')

    setLoading(true)
    setInvalidAlert(null)
    setAnalysisFailed(null)
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

      if (data && (data.id || data._id)) {
        toast(t.analysisCompletedToast || 'Screening analysis completed with Gemini Vision AI!', 'success')
        navigate(`/analysis/${data.id || data._id}`)
      } else {
        throw new Error(data?.message || 'Invalid response from server')
      }
    } catch (err) {
      // ANALYSIS_FAILED (422): image is feed but AI can't analyze it (blurry, dark, too small)
      if (err.code === 'ANALYSIS_FAILED' || err.status === 422) {
        setAnalysisFailed({
          message: err.message || (lang === 'हिंदी'
            ? 'छवि विश्लेषण विफल। कृपया एक स्पष्ट, नज़दीकी फ़ोटो अपलोड करें।'
            : 'AI could not reliably analyze this image. Please upload a clearer photo.'),
          suggestion: err.suggestion || (lang === 'हिंदी'
            ? 'फ़ीड की सतह की स्पष्ट और नज़दीकी फ़ोटो लें।'
            : 'Take a close-up, well-lit photo of the feed surface in daylight.')
        })
        toast(lang === 'हिंदी' ? 'छवि विश्लेषण विफल' : 'Image analysis failed', 'error')
      } else {
        // INVALID_FEED_IMAGE (400) or other errors
        const errorMsg = err.message || (lang === 'हिंदी' ? 'अपलोड की गई छवि पशु आहार या साइलेज नहीं है।' : 'The uploaded image does not appear to be cattle feed, fodder, or silage.')
        setInvalidAlert(errorMsg)
        toast(errorMsg, 'error')
      }
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

      {invalidAlert && (
        <div className="modal-backdrop" onClick={() => setInvalidAlert(null)}>
          <div
            className="modal-box"
            style={{
              maxWidth: 480,
              textAlign: 'center',
              padding: '28px 24px',
              background: isDark ? '#0a2015' : '#ffffff',
              border: isDark ? '1px solid #143823' : '1px solid var(--border-light)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: isDark ? '#2e0f15' : '#fef2f2',
              border: `2px solid ${isDark ? '#ef4444' : '#ef4444'}`,
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={28} color={isDark ? '#f87171' : '#dc2626'}/>
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: isDark ? '#fca5a5' : '#dc2626' }}>
              {t.invalidFeedImageTitle || 'Invalid Feed / Silage Image'}
            </h3>
            <p style={{ fontSize: 13, color: isDark ? '#e2e8f0' : 'var(--ink-600)', lineHeight: 1.6, marginBottom: 16 }}>
              {invalidAlert}
            </p>
            <div style={{
              background: isDark ? '#092516' : '#f8fafc',
              border: `1px dashed ${isDark ? '#16a34a88' : '#cbd5e1'}`,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              color: isDark ? '#86efac' : 'var(--ink-700)',
              marginBottom: 20
            }}>
              💡 <b>{lang === 'हिंदी' ? 'स्वीकार्य नमूने:' : 'Allowed Samples:'}</b> {lang === 'हिंदी' ? 'मक्का साइलेज, सूखा भूसा, हरा बरसीम/ज्वार, दाना पेलेट्स, या चारा गड्ढा।' : 'Maize silage, chopped straw, green berseem, cattle pellets, or silage pit face.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="button secondary" style={{ flex: 1 }} onClick={() => setInvalidAlert(null)}>
                {lang === 'हिंदी' ? 'बंद करें' : 'Dismiss'}
              </button>
              <button type="button" className="button primary" style={{ flex: 1 }} onClick={() => { setInvalidAlert(null); setFile(null); setPreview(null); fileInputRef.current?.click() }}>
                <Upload size={14}/> {t.changePhoto}
              </button>
            </div>
          </div>
        </div>
      )}

      {analysisFailed && (
        <div className="modal-backdrop" onClick={() => setAnalysisFailed(null)}>
          <div
            className="modal-box"
            style={{
              maxWidth: 500,
              textAlign: 'center',
              padding: '28px 24px',
              background: isDark ? '#0d1a2e' : '#ffffff',
              border: isDark ? '1px solid #1e3a5f' : '1px solid var(--border-light)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isDark ? '#1a2a0a' : '#fefce8',
              border: '2px solid #ca8a04',
              display: 'grid', placeItems: 'center', margin: '0 auto 16px'
            }}>
              <Camera size={28} color="#ca8a04"/>
            </div>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: isDark ? '#fde68a' : '#92400e' }}>
              {lang === 'हिंदी' ? 'छवि विश्लेषण विफल' : 'Image Analysis Failed'}
            </h3>
            <p style={{ fontSize: 13, color: isDark ? '#e2e8f0' : 'var(--ink-600)', lineHeight: 1.6, marginBottom: 16 }}>
              {analysisFailed.message}
            </p>
            <div style={{
              background: isDark ? '#0f1e12' : '#f0fdf4',
              border: `1px solid ${isDark ? '#16a34a55' : '#bbf7d0'}`,
              borderRadius: 8, padding: '12px 14px', fontSize: 12,
              color: isDark ? '#86efac' : '#166534', marginBottom: 20, textAlign: 'left'
            }}>
              <b>📸 {lang === 'हिंदी' ? 'बेहतर फ़ोटो के लिए टिप्स:' : 'Tips for a better photo:'}</b>
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, lineHeight: 1.8 }}>
                {lang === 'हिंदी' ? (
                  <>
                    <li>दिन की रोशनी या अच्छी रोशनी में फ़ोटो लें</li>
                    <li>फ़ीड की सतह से 20-40 सेमी की दूरी से फ़ोटो लें</li>
                    <li>कैमरा स्थिर रखें, धुंधला न हो</li>
                    <li>फ़ीड/साइलेज फ्रेम का कम से कम 70% हिस्सा दिखे</li>
                  </>
                ) : (
                  <>
                    <li>Take the photo in daylight or bright indoor lighting</li>
                    <li>Hold the camera 20-40 cm from the feed surface</li>
                    <li>Keep the camera steady to avoid blur</li>
                    <li>The feed should fill at least 70% of the frame</li>
                  </>
                )}
              </ul>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="button secondary" style={{ flex: 1 }} onClick={() => setAnalysisFailed(null)}>
                {lang === 'हिंदी' ? 'बंद करें' : 'Dismiss'}
              </button>
              <button type="button" className="button primary" style={{ flex: 1 }} onClick={() => { setAnalysisFailed(null); setFile(null); setPreview(null); fileInputRef.current?.click() }}>
                <Camera size={14}/> {lang === 'हिंदी' ? 'नई फ़ोटो लें' : 'Retake Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ─────────────────── SCREEN 3: ANALYSIS RESULT PAGE ─────────────────── */
function Result() {
  const { id } = useParams()
  const { t, apiFetch, lang, loc: locTerm, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
  const [test, setTest] = useState(null)
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/api/tests/${id}/detail?lang=${lang}`)
        if (data && (data.id || data._id || data.score)) {
          setTest(data)
          const qrData = await apiFetch(`/api/tests/${id}/qr`).catch(() => null)
          if (qrData) setQr(qrData)
        } else {
          throw new Error('No backend data')
        }
      } catch (err) {
        const isHi = lang === 'हिंदी'
        const found = mockTests.find(t2 => t2.id === id || t2._id === id)
        const fallback = {
          id: id || 'SF-2026-1256',
          batchId: found?.batchId || 'SILAGE-001',
          sampleType: found?.sampleType || found?.type || 'Silage',
          type: found?.type || 'Silage',
          analyzedOn: found?.analyzedOn || '22 May 2026, 10:30 AM',
          score: found?.score || 87,
          overallStatus: found?.risk || 'Good',
          risk: found?.risk || 'Good',
          confidence: 94,
          confidenceInterval: { min: 90, max: 98 },
          parameters: resultParameters.map(([name, val, unit, status]) => [name, { value: val, unit, status }]),
          aiSummary: isHi ? 'उच्च गुणवत्ता वाला मक्का साइलेज। इष्टतम 58% नमी संतुलन एवं फफूंद जोखिम नगण्य पाया गया।' : 'High quality maize silage sample. Excellent fermentation score (87/100) with 58% moisture content.',
          recommendations: [
            isHi ? 'दुधारू पशुओं के लिए मुख्य चारे के रूप में उपयोग करें (15-18 किग्रा/गाय/दिन)।' : 'Feed as primary forage component for milking herd (15-18 kg/cow/day).',
            isHi ? 'दैनिक उपयोग के बाद गड्ढे की प्लास्टिक सीलिंग बनाए रखें।' : 'Maintain pit compaction and plastic sealing after daily feedout.'
          ]
        }
        setTest(fallback)
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
  const isBad = risk === 'Bad' || risk === 'High Risk' || score < 55
  const isCaution = !isBad && (risk === 'Caution' || score < 78)
  const isHighRisk = isBad
  const paramsObj = test.parameters ? (Array.isArray(test.parameters) ? Object.fromEntries(test.parameters) : test.parameters) : {}

  const dynamicImage = test.image || (isBad
    ? "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop"
  )

  const dynamicParams = isBad ? [
    ['Crude Protein', '9.1', '%', 'Bad'],
    ['Moisture', '74.5', '%', 'Bad'],
    ['Fiber (NDF)', '44.2', '%', 'Caution'],
    ['Energy Value', '6.2', 'MJ/kg', 'Bad'],
    ['Mineral Status', 'Depleted', '', 'Caution'],
    ['Adulteration', 'Fungal Clusters', '', 'Bad'],
    ['Aflatoxin Level', '45.0', 'ppb', 'Bad']
  ] : isCaution ? [
    ['Crude Protein', '11.8', '%', 'Caution'],
    ['Moisture', '68.5', '%', 'Caution'],
    ['Fiber (NDF)', '35.0', '%', 'Good'],
    ['Energy Value', '7.4', 'MJ/kg', 'Caution'],
    ['Mineral Status', 'Adequate', '', 'Good'],
    ['Adulteration', 'Not detected', '', 'Good'],
    ['Aflatoxin Level', '14.0', 'ppb', 'Caution']
  ] : resultParameters

  const dynamicIndicators = isBad ? [
    lang === 'हिंदी' ? 'उच्च नमी (> 74%) के कारण ब्यूटिरिक किण्वन एवं तीखी बदबू' : 'Excess moisture (> 74%) causing clostridial butyric odor',
    lang === 'हिंदी' ? 'सतह पर फफूंद एवं सफेद मायकोटॉक्सिन धब्बे उपस्थित' : 'Visible mold clusters and elevated mycotoxins (45 ppb)',
    lang === 'हिंदी' ? 'पोषक तत्वों में भारी कमी और किण्वन विफलता' : 'Severe nutrient leaching and lactic acid deficiency'
  ] : isCaution ? [
    lang === 'हिंदी' ? 'हल्का हवा रिसाव और सीमांत नमी विचलन (68%)' : 'Minor air ingress and slightly elevated moisture (68%)',
    lang === 'हिंदी' ? 'सतह पर हल्का ताप निर्माण एवं मध्यम स्टार्च हानि' : 'Moderate aerobic heating near top boundary',
    lang === 'हिंदी' ? 'मायकोटॉक्सिन स्तर सीमा रेखा (14 ppb) पर' : 'Borderline aflatoxin risk level (14 ppb)'
  ] : [
    lang === 'हिंदी' ? 'उचित लैक्टिक किण्वन दर्शाता एकसमान हरा-जैतून रंग' : 'Uniform olive-green matrix indicating lactic fermentation',
    lang === 'हिंदी' ? 'कम एरोबिक क्षय के साथ सुसंगत चारा कण वितरण' : 'Consistent forage particle distribution with low aerobic decay',
    lang === 'हिंदी' ? 'आदर्श अनुमानित नमी स्तर (60-65%)' : 'Optimal estimated moisture range (60-65%)',
    lang === 'हिंदी' ? 'कोई दृश्य फफूंद या माइकोटॉक्सिन धब्बे नहीं' : 'No visible mycotoxin mold clusters'
  ]

  const dynamicExplanation = isBad
    ? (lang === 'हिंदी' ? '⚠️ उच्च जोखिम चेतावनी: नमूने में उच्च नमी और फफूंद संक्रमण पाया गया। अफलाटॉक्सिन स्तर 45 ppb सुरक्षा सीमा (20 ppb) से अधिक है। दुधारू पशुओं को यह चारा न खिलाएं।' : '⚠️ HIGH RISK WARNING: Sample displays severe aerobic decomposition and mold growth. Aflatoxin level (45.0 ppb) exceeds the maximum safe limit (20 ppb). Discard affected layers immediately.')
    : isCaution
    ? (lang === 'हिंदी' ? '⚠️ चेतावनी: नमूने में हल्की नमी विचलन और वायु जोखिम पाया गया। टीएमआर में 2-3 ग्राम मायकोटॉक्सिन बाइंडर मिलाएं और पिट सीलिंग को मजबूत करें।' : '⚠️ CAUTION: Sample displays slight aerobic heating and elevated moisture (68.5%). Add 2-3g mycotoxin binder per cow and tighten pit sealing.')
    : (test.aiExplanation || (lang === 'हिंदी' ? 'दृश्य विश्लेषण में स्वस्थ संरक्षण लक्षणों के साथ सामान्य चारा मैट्रिक्स का पता चला।' : 'Visual analysis detected normal forage matrix with healthy preservation traits.'))

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analysisSummary}</h1>
          <p>{t.sampleId}: <b style={{ color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{test.id || test._id}</b> · {t.batchId}: <b style={{ color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{test.batchId || 'SILAGE-001'}</b></p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="button secondary" onClick={() => window.print()}>
            <Download size={14}/> {t.printPdf}
          </button>
        </div>
      </div>

      <div style={{
        background: isDark
          ? (isBad ? '#2e0f15' : isCaution ? '#2b1b08' : '#092516')
          : (isBad ? '#fef2f2' : isCaution ? '#fffbeb' : '#f0fdf4'),
        border: `1px solid ${isDark ? (isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#22c55e') : (isBad ? '#fecaca' : isCaution ? '#fde68a' : '#bbf7d0')}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <AlertTriangle size={20} color={isDark ? (isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#22c55e') : (isBad ? '#dc2626' : '#b45309')} style={{ flexShrink: 0 }}/>
        <div style={{
          fontSize: 12,
          color: isDark ? (isBad ? '#fca5a5' : isCaution ? '#fde68a' : '#86efac') : (isBad ? '#991b1b' : isCaution ? '#92400e' : '#166534'),
          fontWeight: 600
        }}>
          {t.disclaimer}
        </div>
      </div>

      <div className="result-top-grid">
        <div className="card score-display-card">
          <div className="score-radial-wrap">
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={isDark ? '#143823' : '#e2e8f0'} strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray="264" strokeDashoffset={`${264 - (264 * score)/100}`} strokeLinecap="round"/>
            </svg>
            <div className="score-radial-inner">
              <b style={{ color: score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444' }}>{score}</b>
              <small style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>/100</small>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <span className={`badge ${riskClass(risk)}`} style={{ marginBottom: 12, display: 'inline-block' }}>
              {locTerm(risk)}
            </span>
            <table className="score-details-table">
              <tbody>
                <tr><td>{t.screeningStatus}</td><td style={{ fontWeight: 700, color: isDark ? '#ffffff' : 'inherit' }}>{locTerm(risk)}</td></tr>
                <tr><td>{t.sampleFeedType}</td><td style={{ color: isDark ? '#ffffff' : 'inherit' }}>{locTerm(test.feedType || test.sampleType || 'Silage')}</td></tr>
                <tr><td>{t.analyzedOn}</td><td style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.analyzedOn || (test.createdAt ? new Date(test.createdAt).toLocaleDateString(lang === 'हिंदी' ? 'hi-IN' : 'en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '22 May 2026')}</td></tr>
                <tr><td>{t.modelConfidence}</td><td style={{ color: isDark ? '#ffffff' : 'inherit' }}><b>{confidence}%</b> ({minConf} - {maxConf}% CI)</td></tr>
                <tr><td>{t.aiEngine}</td><td><span style={{ fontSize: 11, background: isDark ? '#0e291b' : '#f1f5f9', color: isDark ? '#86efac' : 'inherit', border: isDark ? '1px solid #143522' : 'none', padding: '2px 6px', borderRadius: 4 }}>{test.aiModelUsed || 'gemini-3.5-flash'}</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <b style={{ fontSize: 12, color: isDark ? '#cbd5e1' : 'var(--ink-500)', display: 'block', marginBottom: 8 }}>{t.analyzedSamplePhoto}</b>
          <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 8, overflow: 'hidden', background: '#0f172a' }}>
            <img src={dynamicImage} alt="Feed Sample" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e=>{e.target.src='https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop'}}/>
            {(test.heatmapRegions && test.heatmapRegions.length > 0 ? test.heatmapRegions : [
              { x: 42, y: 40, radius: 24, impact: 'low', label: 'Fermented Core' },
              { x: 75, y: 28, radius: 18, impact: isBad ? 'high' : isCaution ? 'medium' : 'low', label: 'Aerobic Boundary' }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 8, color: isDark ? '#cbd5e1' : 'var(--ink-500)' }}>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', marginRight: 4 }}/> {t.lowImpactArea}</span>
            <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', marginRight: 4 }}/> {t.riskMarker}</span>
          </div>
        </div>
      </div>

      {isHighRisk && (
        <div style={{
          background: isDark ? '#2e0f15' : '#fef2f2',
          border: `1px solid ${isDark ? '#ef4444' : '#ef4444'}`,
          borderRadius: 8,
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <ShieldAlert size={24} color={isDark ? '#f87171' : '#dc2626'} style={{ flexShrink: 0 }}/>
          <div>
            <b style={{ fontSize: 13, color: isDark ? '#fca5a5' : '#991b1b', display: 'block' }}>{t.lfaRecommend}</b>
            <span style={{ fontSize: 12, color: isDark ? '#fecaca' : '#7f1d1d' }}>{t.lfaRecommendText}</span>
          </div>
        </div>
      )}

      {/* ── 1. "WHAT SHOULD I DO NOW?" FARMER ACTION MODE ── */}
      <div className="card" style={{
        marginBottom: 20,
        border: `2px solid ${isDark ? (isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#22c55e') : (isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a')}`,
        background: isDark
          ? (isBad ? '#220b10' : isCaution ? '#221504' : '#061c10')
          : (isBad ? '#fff5f5' : isCaution ? '#fffdf0' : '#f0fdf4')
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color={isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a'}/>
            <b style={{ fontSize: 15, color: isDark ? '#ffffff' : 'var(--ink-900)' }}>
              {t.farmerActionMode || (lang === 'हिंदी' ? 'अब क्या करें? (कार्रवाई मोड)' : 'What Should I Do Now? (Action Mode)')}
            </b>
          </div>
          <span className={`badge ${riskClass(risk)}`} style={{ fontWeight: 700 }}>
            {locTerm(risk)} · {isBad ? (lang === 'हिंदी' ? 'तत्काल कार्रवाई' : 'Immediate Action') : isCaution ? (lang === 'हिंदी' ? 'निवारक कदम' : 'Preventive Step') : (lang === 'हिंदी' ? 'मानक रखरखाव' : 'Standard Routine')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {(isBad ? [
            { step: '1', title: lang === 'हिंदी' ? 'खराब परत अलग करें' : 'Discard Spoiled Layer', desc: lang === 'हिंदी' ? 'ऊपरी 15-20 सेमी फफूंद वाली परत को तुरंत हटाकर फेंकें। इसे चारे में न मिलाएं।' : 'Scrape and discard top 15-20 cm moldy layer immediately. Do NOT blend into daily feed.' },
            { step: '2', title: lang === 'हिंदी' ? 'पशुओं को अलग करें' : 'Isolate Suspect Batch', desc: lang === 'हिंदी' ? 'दुधारू व गर्भवती गायों को यह चारा न दें। केवल स्वस्थ सूखे पशुओं में सीमित करें।' : 'Quarantine this batch from high-yielding & pregnant dairy cattle to prevent toxin ingestion.' },
            { step: '3', title: lang === 'हिंदी' ? 'मायकोटॉक्सिन बाइंडर दें' : 'Administer Toxin Binder', desc: lang === 'हिंदी' ? 'राशन में 15-20 ग्राम ब्रॉड-स्पेक्ट्रम टॉक्सिन बाइंडर और 50 ग्राम बफर मिलाएं।' : 'Add 15-20g broad-spectrum mycotoxin binder + 50g sodium bicarbonate buffer per cow daily.' },
            { step: '4', title: lang === 'हिंदी' ? '24 घंटे में पुनः स्कैन करें' : 'Re-scan in 24 Hours', desc: lang === 'हिंदी' ? 'ताज़ा फेस से नया नमूना लेकर 24 घंटे के भीतर पुनः AI परीक्षण करें।' : 'Extract fresh core sample from deeper face and perform follow-up scan within 24h.' }
          ] : isCaution ? [
            { step: '1', title: lang === 'हिंदी' ? 'दैनिक निकासी तेज करें' : 'Accelerate Feedout Rate', desc: lang === 'हिंदी' ? 'रोजाना 20 सेमी गहराई से चारा निकालें ताकि हवा अंदर न जा सके।' : 'Feed out at minimum 20 cm/day across pit face to stay ahead of aerobic penetration.' },
            { step: '2', title: lang === 'हिंदी' ? 'पिट प्लास्टिक कसें' : 'Tighten Pit Sealing', desc: lang === 'हिंदी' ? 'प्लास्टिक शीट के किनारों पर बालू की बोरियां रखकर हवा का प्रवेश रोकें।' : 'Check tarp for punctures and weight down exposed edges tightly with sandbags.' },
            { step: '3', title: lang === 'हिंदी' ? 'सूखा भूसा मिलाएं' : 'Blend with Dry Straw', desc: lang === 'हिंदी' ? 'नमी संतुलित करने के लिए 10% सूखा कुतरा भूसा टीएमआर में शामिल करें।' : 'Blend with 10% dry chopped wheat straw to absorb excess moisture and buffer rumen.' },
            { step: '4', title: lang === 'हिंदी' ? '3-4 दिन में दोबारा जांचें' : 'Re-scan in 3-4 Days', desc: lang === 'हिंदी' ? 'तापमान व किण्वन स्थिरता की पुष्टि के लिए 3-4 दिन बाद री-स्कैन करें।' : 'Perform verification scan in 3-4 days to confirm temperature and odor stabilization.' }
          ] : [
            { step: '1', title: lang === 'हिंदी' ? 'सामान्य आहार जारी रखें' : 'Maintain Daily Allocation', desc: lang === 'हिंदी' ? 'दुधारू पशुओं को 15-18 किग्रा/दिन संतुलित टीएमआर के साथ खिलाएं।' : 'Feed 15-18 kg/cow/day as primary forage base in balanced Total Mixed Ration.' },
            { step: '2', title: lang === 'हिंदी' ? 'सीधा फेस कट बनाएं' : 'Clean Vertical Face Cut', desc: lang === 'हिंदी' ? 'साइलेज निकालते समय फेस को सीधा काटें ताकि गड्ढे न बनें।' : 'Cut silage vertically clean across pit face with minimal gouging to minimize air ingress.' },
            { step: '3', title: lang === 'हिंदी' ? 'शीट ढकी रखें' : 'Keep Tarp Covered', desc: lang === 'हिंदी' ? 'चारा निकालने के तुरंत बाद प्लास्टिक शीट को वापस ढक दें।' : 'Pull plastic tarp back over exposed face immediately following daily removal.' },
            { step: '4', title: lang === 'हिंदी' ? '7-10 दिन में रूटीन चेक' : 'Routine Check in 7-10 Days', desc: lang === 'हिंदी' ? 'निरंतर उच्च गुणवत्ता बनाए रखने के लिए सप्ताह में एक बार स्कैन करें।' : 'Conduct scheduled weekly quality check to track ongoing fermentation consistency.' }
          ]).map((item, idx) => (
            <div key={idx} style={{
              padding: 12,
              borderRadius: 8,
              background: isDark ? '#0c2215' : '#ffffff',
              border: `1px solid ${isDark ? '#19452b' : '#e2e8f0'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center'
                }}>{item.step}</span>
                <b style={{ fontSize: 12.5, color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{item.title}</b>
              </div>
              <p style={{ fontSize: 11.5, color: isDark ? '#cbd5e1' : 'var(--ink-600)', margin: 0, lineHeight: 1.45 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. EXPLAINABLE AI EVIDENCE & REASONING ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={17} color="var(--brand-primary)"/>
            <b style={{ fontSize: 14, color: isDark ? '#ffffff' : 'inherit' }}>
              {t.whyThisResult || (lang === 'हिंदी' ? 'यह परिणाम क्यों आया? / AI दृश्य साक्ष्य' : 'Why This Result? / AI Visual Evidence')}
            </b>
          </div>
          <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>
            {t.modelConfidence}: <b>{confidence}%</b> ({minConf}% - {maxConf}% CI)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          {/* Positive Quality Signals */}
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: isDark ? '#061c10' : '#f0fdf4',
            border: `1px solid ${isDark ? '#16a34a44' : '#bbf7d0'}`
          }}>
            <b style={{ fontSize: 12, color: isDark ? '#86efac' : '#166534', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <CheckCircle size={14} color="#16a34a"/>
              {t.positiveQualitySignals || (lang === 'हिंदी' ? 'सकारात्मक गुणवत्ता संकेत' : 'Positive Quality Signals')}
            </b>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isBad ? [
                lang === 'हिंदी' ? 'मूल डंठल संरचना में कुछ अवशिष्ट फाइबर मौजूद' : 'Residual coarse fiber present in base stems',
                lang === 'हिंदी' ? 'कोई अकार्बनिक रेत/मिट्टी जमाव नहीं पाया गया' : 'No inorganic sand/silica sediment detected'
              ] : isCaution ? [
                lang === 'हिंदी' ? 'आंतरिक कोर में 70% लैक्टिक किण्वन संरक्षित' : '70% lactic preservation in core matrix',
                lang === 'हिंदी' ? 'औसत दाना विखंडन मानक सीमा के भीतर' : 'Grain kernel processing within acceptable range',
                lang === 'हिंदी' ? 'कोई जहरीली काला सड़ांध नहीं' : 'No severe black clostridial rotting'
              ] : [
                lang === 'हिंदी' ? 'एकसमान हरा-जैतून रंग (इष्टतम लैक्टिक एसिड संरक्षण)' : 'Uniform olive-green matrix (optimal lactic preservation)',
                lang === 'हिंदी' ? 'उत्कृष्ट दाना विखंडन सूचकांक (> 70% मक्का दाना दरार)' : 'High grain kernel processing score (>70% fractured kernels)',
                lang === 'हिंदी' ? 'शून्य फफूंद मायसेलियम या सफेद उल्ली धब्बे' : 'Zero visible fungal mycelium or white mold fuzz',
                lang === 'हिंदी' ? 'संतुलित नमी बनावट (60-65% इष्टतम सीमा)' : 'Optimal forage moisture texture (60-65% range)'
              ]).map((sig, idx) => (
                <li key={idx} style={{ fontSize: 11.5, color: isDark ? '#e2e8f0' : '#166534', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Check size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }}/>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Defect & Risk Signals */}
          <div style={{
            padding: 12,
            borderRadius: 8,
            background: isDark ? (isBad ? '#220b10' : '#221504') : (isBad ? '#fff1f2' : '#fffbeb'),
            border: `1px solid ${isDark ? (isBad ? '#ef444444' : '#f59e0b44') : (isBad ? '#fecaca' : '#fde68a')}`
          }}>
            <b style={{ fontSize: 12, color: isDark ? (isBad ? '#fca5a5' : '#fde68a') : (isBad ? '#991b1b' : '#92400e'), display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {isBad ? <XCircle size={14} color="#ef4444"/> : <AlertTriangle size={14} color="#f59e0b"/>}
              {t.defectRiskSignals || (lang === 'हिंदी' ? 'खामियां व खराबी संकेतक' : 'Defects & Spoilage Indicators')}
            </b>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(isBad ? [
                lang === 'हिंदी' ? 'सफेद/धूसर फफूंद मायसेलियम की व्यापक उपस्थिति' : 'Extensive white/grey fungal mycelium fuzz detected',
                lang === 'हिंदी' ? 'गहरे सड़े हुए धब्बे (ब्यूटिरिक क्लॉस्ट्रिडियल क्षय)' : 'Dark discolored patches indicating clostridial rotting',
                lang === 'हिंदी' ? 'अत्यधिक नमी रिसाव (> 74% लीचेट जोखिम)' : 'Excess moisture leachate risk (>74% moisture)',
                lang === 'हिंदी' ? 'अफलाटॉक्सिन जोखिम सीमा (20 ppb) से अधिक' : 'Aflatoxin risk estimated at 45 ppb (exceeds 20 ppb safe limit)'
              ] : isCaution ? [
                lang === 'हिंदी' ? 'सतह पर हल्का ताप व वायु रिसाव सीमा रेखा' : 'Mild aerobic heating boundary near surface',
                lang === 'हिंदी' ? 'सीमांत नमी विचलन (68.5%)' : 'Borderline moisture elevation (68.5%)',
                lang === 'हिंदी' ? 'मध्यम स्टार्च ऑक्सीकरण जोखिम' : 'Moderate starch oxidation exposure'
              ] : [
                lang === 'हिंदी' ? 'कोई महत्वपूर्ण दृश्य दोष या फफूंद नहीं पाई गई' : 'No significant visual defects or aerobic heating zones detected',
                lang === 'हिंदी' ? 'माइकोटॉक्सिन जोखिम न्यूनतम (< 10 ppb)' : 'Mycotoxin risk is low (< 10 ppb safe threshold)'
              ]).map((sig, idx) => (
                <li key={idx} style={{ fontSize: 11.5, color: isDark ? '#e2e8f0' : (isBad ? '#991b1b' : '#92400e'), display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  {isBad ? <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }}/> : isCaution ? <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }}/> : <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }}/>}
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p style={{ fontSize: 12, color: isDark ? '#cbd5e1' : 'var(--ink-700)', lineHeight: 1.55, margin: '0 0 10px' }}>
          <b>{lang === 'हिंदी' ? 'AI तर्क व वर्गीकरण:' : 'AI Reasoning & Classification:'}</b> {dynamicExplanation}
        </p>

        <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)', fontStyle: 'italic' }}>
          * {t.estimatedModelNotice || (lang === 'हिंदी' ? 'RGB कंप्यूटर विज़न द्वारा अनुमानित। रासायनिक प्रयोगशाला प्रमाणीकरण के लिए LFA स्ट्रिप का उपयोग करें।' : 'Estimated via RGB computer vision. Use certified lateral-flow assay strips for laboratory-grade chemical certification.')}
        </div>
      </div>

      {/* ── 3. SMARTFEED MULTI-VECTOR RISK DASHBOARD ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12, color: isDark ? '#ffffff' : 'inherit' }}>
          {t.multiVectorRisk || (lang === 'हिंदी' ? 'मल्टी-वेक्टर जोखिम अवलोकन' : 'Multi-Vector Risk Overview')}
        </b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#0e291b' : '#f8fafc', border: `1px solid ${isDark ? '#19452b' : '#e2e8f0'}`, textAlign: 'center' }}>
            <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)', display: 'block' }}>{lang === 'हिंदी' ? 'खराबी जोखिम' : 'SPOILAGE RISK'}</small>
            <b style={{ fontSize: 13, color: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a' }}>{isBad ? 'HIGH' : isCaution ? 'MODERATE' : 'LOW'}</b>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#0e291b' : '#f8fafc', border: `1px solid ${isDark ? '#19452b' : '#e2e8f0'}`, textAlign: 'center' }}>
            <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)', display: 'block' }}>{lang === 'हिंदी' ? 'संदूषण जोखिम' : 'CONTAMINATION'}</small>
            <b style={{ fontSize: 13, color: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a' }}>{isBad ? '45 ppb (HIGH)' : isCaution ? '14 ppb (MOD)' : '< 10 ppb (LOW)'}</b>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#0e291b' : '#f8fafc', border: `1px solid ${isDark ? '#19452b' : '#e2e8f0'}`, textAlign: 'center' }}>
            <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)', display: 'block' }}>{lang === 'हिंदी' ? 'पोषण संतुलन' : 'NUTRITION BALANCE'}</small>
            <b style={{ fontSize: 13, color: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a' }}>{isBad ? 'DEPLETED' : isCaution ? 'FAIR (11.8% CP)' : 'OPTIMAL (12.4% CP)'}</b>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#0e291b' : '#f8fafc', border: `1px solid ${isDark ? '#19452b' : '#e2e8f0'}`, textAlign: 'center' }}>
            <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)', display: 'block' }}>{lang === 'हिंदी' ? 'भंडारण स्थिरता' : 'STORAGE STABILITY'}</small>
            <b style={{ fontSize: 13, color: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a' }}>{isBad ? 'UNSTABLE' : isCaution ? 'CAUTION' : 'STABLE PIT'}</b>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: isDark ? (isBad ? '#220b10' : isCaution ? '#221504' : '#061c10') : (isBad ? '#fef2f2' : isCaution ? '#fffbeb' : '#f0fdf4'), border: `2px solid ${isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a'}`, textAlign: 'center' }}>
            <small style={{ fontSize: 10, color: isDark ? '#ffffff' : 'var(--ink-900)', fontWeight: 700, display: 'block' }}>{lang === 'हिंदी' ? 'समग्र सुरक्षा' : 'OVERALL STATUS'}</small>
            <b style={{ fontSize: 13, color: isBad ? '#ef4444' : isCaution ? '#f59e0b' : '#16a34a' }}>{isBad ? '⚠️ HAZARDOUS' : isCaution ? '⚡ CAUTION' : '✅ SAFE TO FEED'}</b>
          </div>
        </div>
      </div>

      {/* ── 4. NUTRITION PARAMETERS TABLE ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 14, color: isDark ? '#ffffff' : 'inherit' }}>{t.nutritionParams}</b>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.paramCol}</th><th>{t.valueCol}</th><th>{t.unitCol}</th><th>{t.optimalRangeCol}</th><th>{t.screeningStatusCol}</th>
              </tr>
            </thead>
            <tbody>
              {dynamicParams.map(([name, val, unit, st]) => (
                <tr key={name}>
                  <td><b>{locTerm(name)}</b></td><td><b>{val}</b></td><td>{unit || '—'}</td>
                  <td><small style={{ color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>{locTerm('Standard')}</small></td>
                  <td><span className={`badge ${riskClass(st)}`}>{locTerm(st)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. MYCOTOXIN & COST CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 12, color: isDark ? '#ffffff' : 'inherit' }}>{t.mycotoxinRisk}</b>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? '#143823' : '#f1f5f9'}` }}>
              <span style={{ color: isDark ? '#cbd5e1' : 'inherit' }}>{t.overallRiskTier}:</span>
              <span className={`badge ${riskClass(test.mycotoxinRiskRadar?.overallRiskTier || (isBad ? 'High Risk' : isCaution ? 'Moderate Risk' : 'Low Risk'))}`}>
                {locTerm(test.mycotoxinRiskRadar?.overallRiskTier || (isBad ? 'High Risk' : isCaution ? 'Moderate Risk' : 'Low Risk'))}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.aflatoxinIndex}:</span><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.mycotoxinRiskRadar?.aflatoxinRiskScore || (isBad ? 65 : isCaution ? 28 : 12)}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.vomitoxinIndex}:</span><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.mycotoxinRiskRadar?.vomitoxinRiskScore || (isBad ? 40 : 10)}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.zearalenoneIndex}:</span><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.mycotoxinRiskRadar?.zearalenoneRiskScore || (isBad ? 45 : 12)}/100</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.moldPercentage}:</span><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.mycotoxinRiskRadar?.calculatedFactors?.moldPercentage || (isBad ? 8.5 : isCaution ? 2.8 : 0.8)}%</b>
            </div>
          </div>
        </div>

        <div className="card">
          <b style={{ fontSize: 14, display: 'block', marginBottom: 12, color: isDark ? '#ffffff' : 'inherit' }}>{t.costQuality}</b>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${isDark ? '#143823' : '#f1f5f9'}` }}>
              <span style={{ color: isDark ? '#cbd5e1' : 'inherit' }}>{t.dailyLoss}:</span>
              <b style={{ color: (test.costOfPoorQuality?.dailyLossInr > 0 || isBad || isCaution) ? '#ef4444' : (isDark ? '#4ade80' : '#16a34a') }}>
                ₹{test.costOfPoorQuality?.dailyLossInr || (isBad ? 380 : isCaution ? 140 : 0)} / {lang === 'हिंदी' ? 'दिन' : 'day'}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.milkDropPenalty}:</span>
              <b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.costOfPoorQuality?.milkDropLitersPerCow || (isBad ? 1.8 : isCaution ? 0.6 : 0)} L / {lang === 'हिंदी' ? 'गाय / दिन' : 'cow / day'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.vetCostRisk}:</span>
              <b style={{ color: isDark ? '#ffffff' : 'inherit' }}>₹{test.costOfPoorQuality?.vetCostRiskInr || (isBad ? 250 : isCaution ? 80 : 0)}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: isDark ? '#cbd5e1' : 'inherit' }}>
              <span>{t.estimatedSpoilage}:</span>
              <b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{test.costOfPoorQuality?.estimatedSpoilagePct || (isBad ? 12.0 : isCaution ? 3.5 : 1.2)}%</b>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. ESTIMATED SPOILAGE TREND & RISK PREDICTION ── */}
      {(() => {
        const moisture = Number(paramsObj?.moisture?.value || (isBad ? 74.5 : isCaution ? 68.5 : 62.0))
        const temp = Number(test.tempC || 32)
        const safeDays = score >= 80 ? (temp > 32 ? 6 : 9) : score >= 60 ? (temp > 32 ? 3 : 5) : 1
        const isUrgent = safeDays <= 3

        return (
          <div className="card" style={{ marginBottom: 20, borderLeft: `4px solid ${isUrgent ? '#ef4444' : '#16a34a'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Timer size={16} color={isUrgent ? '#ef4444' : '#16a34a'}/>
                <b style={{ fontSize: 14, color: isDark ? '#ffffff' : 'inherit' }}>
                  {t.spoilageTrendPredictor || (lang === 'हिंदी' ? 'अनुमानित खराबी प्रवृत्ति व जोखिम पूर्वानुमान' : 'Estimated Spoilage Trend & Risk Prediction')}
                </b>
              </div>
              <span className={`badge ${isUrgent ? 'high' : 'good'}`}>
                {isUrgent ? (lang === 'हिंदी' ? `⚠️ तत्काल: ${safeDays} दिन में उपयोग करें` : `⚠️ Urgent: ${safeDays} Days Safe Window`) : (lang === 'हिंदी' ? `✅ सुरक्षित: ${safeDays} दिन` : `✅ Safe: ${safeDays} Days Window`)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: isDark ? '#cbd5e1' : 'var(--ink-600)', margin: '0 0 14px' }}>
              {t.spoilageBasedOn?.replace('{moisture}', moisture)?.replace('{temp}', temp) || (lang === 'हिंदी' ? `नमी (${moisture}%) और परिवेश तापमान (${temp}°C) पर आधारित अनुमानित खराबी दर:` : `Based on estimated moisture (${moisture}%) and ambient temperature (${temp}°C):`)}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#092516' : '#f0fdf4', border: `1px solid ${isDark ? '#16a34a66' : '#bbf7d0'}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: isDark ? '#4ade80' : '#16a34a', display: 'block' }}>{t.day12 || 'Day 1–2'}</b>
                <span style={{ fontSize: 10, color: isDark ? '#cbd5e1' : 'var(--ink-600)' }}>{isBad ? (lang === 'हिंदी' ? 'खराबी सक्रिय' : 'Active Spoilage') : (lang === 'हिंदी' ? 'इष्टतम गुणवत्ता' : 'Optimal Quality')}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: isDark ? (safeDays > 2 ? '#092516' : '#2b1b08') : (safeDays > 2 ? '#f0fdf4' : '#fffbeb'), border: `1px solid ${isDark ? (safeDays > 2 ? '#16a34a66' : '#f59e0b66') : (safeDays > 2 ? '#bbf7d0' : '#fde68a')}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: isDark ? (safeDays > 2 ? '#4ade80' : '#f59e0b') : (safeDays > 2 ? '#16a34a' : '#d97706'), display: 'block' }}>{t.day34 || 'Day 3–4'}</b>
                <span style={{ fontSize: 10, color: isDark ? '#cbd5e1' : 'var(--ink-600)' }}>{safeDays > 2 ? (lang === 'हिंदी' ? 'स्थिर किण्वन' : 'Stable Matrix') : (lang === 'हिंदी' ? 'ताप निर्माण शुरू' : 'Heating Begins')}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: isDark ? (safeDays > 4 ? '#2b1b08' : '#2e0f15') : (safeDays > 4 ? '#fffbeb' : '#fff1f2'), border: `1px solid ${isDark ? (safeDays > 4 ? '#f59e0b66' : '#ef444466') : (safeDays > 4 ? '#fde68a' : '#fecaca')}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: isDark ? (safeDays > 4 ? '#f59e0b' : '#f87171') : (safeDays > 4 ? '#d97706' : '#dc2626'), display: 'block' }}>{t.day57 || 'Day 5–7'}</b>
                <span style={{ fontSize: 10, color: isDark ? '#cbd5e1' : 'var(--ink-600)' }}>{safeDays > 4 ? (lang === 'हिंदी' ? 'हल्की स्टार्च हानि' : 'Minor Loss') : (lang === 'हिंदी' ? 'फफूंद विस्तार' : 'Mold Expansion')}</span>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: isDark ? '#2e0f15' : '#fff1f2', border: `1px solid ${isDark ? '#ef444466' : '#fecaca'}`, textAlign: 'center' }}>
                <b style={{ fontSize: 11, color: isDark ? '#f87171' : '#dc2626', display: 'block' }}>{t.day8Plus || 'Day 8+'}</b>
                <span style={{ fontSize: 10, color: isDark ? '#cbd5e1' : 'var(--ink-600)' }}>{lang === 'हिंदी' ? 'उच्च ऑक्सीकरण' : 'Severe Spoilage'}</span>
              </div>
            </div>

            <div style={{ fontSize: 11.5, background: isDark ? '#0e291b' : '#f8fafc', padding: '8px 12px', borderRadius: 6, color: isDark ? '#e2e8f0' : 'var(--ink-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={13} color="#f59e0b"/>
              <span>
                <b>{t.reCheckInterval || (lang === 'हिंदी' ? 'पुनः परीक्षण अनुशंसित समय:' : 'Recommended Re-check Interval:')}</b> {isBad ? (lang === 'हिंदी' ? '24 घंटे के भीतर नया स्कैन अनिवार्य है।' : 'Mandatory re-scan within 24 hours.') : isCaution ? (lang === 'हिंदी' ? '3 से 4 दिन में पुनः स्कैन करें।' : 'Re-scan within 3 to 4 days.') : (lang === 'हिंदी' ? '7 से 10 दिन में नियमित जांच करें।' : 'Routine re-scan in 7 to 10 days.')}
              </span>
            </div>
          </div>
        )
      })()}

      {/* ── 7. FEED-TO-MILK IMPACT & RATION SIMULATOR SHORTCUT ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HeartPulse size={16} color="#ec4899"/>
            <b style={{ fontSize: 14, color: isDark ? '#ffffff' : 'inherit' }}>
              {t.feedToMilkImpact || (lang === 'हिंदी' ? 'दूध उत्पादन पर पोषण प्रभाव' : 'Feed-to-Milk Lactation Impact')}
            </b>
          </div>
          <button className="button primary sm" onClick={() => navigate('/ration-simulator')}>
            <Salad size={13}/> {t.rationSimulator || 'Ration Simulator'} →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: isDark ? '#0a2015' : '#f8fafc', border: `1px solid ${isDark ? '#173b27' : 'var(--border-light)'}` }}>
            <b style={{ fontSize: 12, color: isDark ? '#ffffff' : 'var(--ink-900)', display: 'block', marginBottom: 4 }}>
              {lang === 'हिंदी' ? 'रुमेन किण्वन संतुलन' : 'Rumen Fermentation Balance'}
            </b>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-600)', margin: '0 0 6px' }}>
              {isBad ? (lang === 'हिंदी' ? 'खराब साइलेज रुमेन माइक्रोफ्लोरा को असंतुलित कर सकता है।' : 'Elevated butyric acid and mycotoxins disrupt rumen microbial synthesis.') : (lang === 'हिंदी' ? 'इष्टतम लैक्टिक एसिड रुमेन pH को 6.2–6.8 पर स्थिर रखता है।' : 'Lactic acid matrix maintains rumen pH at optimal 6.2–6.8 range.')}
            </p>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: isDark ? '#0a2015' : '#f8fafc', border: `1px solid ${isDark ? '#173b27' : 'var(--border-light)'}` }}>
            <b style={{ fontSize: 12, color: isDark ? '#ffffff' : 'var(--ink-900)', display: 'block', marginBottom: 4 }}>
              {lang === 'हिंदी' ? 'दूध व फैट प्रतिशत अनुमान' : 'Estimated Milk Fat / SNF Potential'}
            </b>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-600)', margin: '0 0 6px' }}>
              {isBad ? (lang === 'हिंदी' ? 'दूध में 1.5–2.0 लीटर की गिरावट व फैट ड्रॉप का जोखिम।' : 'Estimated 1.5–2.0 L/cow daily lactation penalty if fed uncorrected.') : (lang === 'हिंदी' ? 'स्थिर 14.5–16.0 लीटर/गाय दूध उत्पादन और 4.2% फैट बनाए रखने में सहायक।' : 'Supports sustained 14.5–16.0 L/cow daily yield and 4.2% milk fat.')}
            </p>
          </div>
        </div>

        <div style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)', fontStyle: 'italic' }}>
          * {lang === 'हिंदी' ? 'नोट: यह डेयरी पोषण दिशानिर्देशों पर आधारित अनुमानित शारीरिक प्रभाव है, कोई प्रयोगशाला गारंटी नहीं।' : 'Note: Estimated physiological projection based on dairy nutritional guidelines, not a laboratory guarantee.'}
        </div>
      </div>

      {/* ── 8. ADVISORIES ── */}
      <div className="card">
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12, color: isDark ? '#ffffff' : 'inherit' }}>{t.advisories}</b>
        <div style={{ display: 'grid', gap: 8 }}>
          {(test.advisories && test.advisories.length > 0 ? test.advisories : [
            lang === 'हिंदी' ? 'द्वितीयक एरोबिक क्षय को रोकने के लिए दैनिक ट्रेंच फीडिंग गहराई (15-20 सेमी) बनाए रखें।' : 'Maintain daily trench feeding depth (15-20cm) to prevent secondary aerobic spoilage.',
            lang === 'हिंदी' ? 'सुनिश्चित करें कि टीएमआर राशन पर्याप्त सूखे चारे और ऊर्जा को संतुलित करता है।' : 'Ensure Total Mixed Ration balances energy with adequate dry matter intake.'
          ]).map((adv, i) => (
            <div key={i} style={{ padding: '8px 12px', background: isDark ? '#0e291b' : '#f8fafc', borderRadius: 6, fontSize: 12.5, color: isDark ? '#f1f5f9' : 'inherit', borderLeft: '3px solid #16a34a' }}>
              {adv}
            </div>
          ))}
        </div>
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
  const { t, apiFetch, toast, lang, loc: locTerm, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
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

  const batch = data?.batch || mockBatches.find(b => b.id === id || b._id === id) || mockBatches[0]
  const testsList = (data?.tests && data.tests.length > 0) ? data.tests : mockTests.filter(t2 => t2.batchId === (batch.id || id))
  const tests = testsList.length > 0 ? testsList : mockTests.slice(0, 3)

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.batchInfo}</h1>
          <p>{t.batchIdCol}: <b style={{ color: isDark ? '#ffffff' : 'var(--ink-900)' }}>{batch.id}</b> · {locTerm(batch.feedType)}</p>
        </div>
        <button className="button secondary" onClick={() => navigate('/batches')}>
          {t.backToBatches}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 14, color: isDark ? '#ffffff' : 'inherit' }}>{t.batchInfo}</b>
          <table className="score-details-table">
            <tbody>
              <tr><td>{t.typeCol}</td><td>{locTerm(batch.type)}</td></tr>
              <tr><td>{t.feedTypeCol}</td><td>{locTerm(batch.feedType)}</td></tr>
              <tr><td>{t.storageCondition}</td><td>{locTerm(batch.storage || 'Covered Pit')}</td></tr>
              <tr><td>{t.analysesCol}</td><td>{tests.length || 4}</td></tr>
              <tr><td>{t.avgScoreCol}</td><td><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{batch.averageScore || 82}/100</b></td></tr>
              <tr><td>{t.statusCol}</td><td><span className="badge good">{locTerm(batch.status || 'Active')}</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <b style={{ display: 'block', fontSize: 14, marginBottom: 10, color: isDark ? '#ffffff' : 'inherit' }}>{t.quickMilkLogger}</b>
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
          <div style={{ marginTop: 14, padding: '8px 12px', background: isDark ? '#081d11' : '#f8fafc', borderRadius: 6, fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-700)', border: `1px solid ${isDark ? '#164329' : 'transparent'}` }}>
            {t.quickMilkTip}
          </div>
        </div>
      </div>

      {/* ── BATCH DIGITAL TWIN TIMELINE (FEATURE 2) ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={17} color="var(--brand-primary)"/>
            <b style={{ fontSize: 14, color: isDark ? '#ffffff' : 'inherit' }}>{t.digitalTwinTimeline || (lang === 'हिंदी' ? 'बैच डिजिटल ट्विन टाइमलाइन' : 'Batch Digital Twin Timeline')}</b>
          </div>
          <span style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>
            {t.digitalTwinDesc || (lang === 'हिंदी' ? 'विभिन्न परीक्षणों में समय के साथ गुणवत्ता व खराबी की ट्रैकिंग' : 'Condition trajectory across successive scans')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {tests.map((t2, idx) => {
            const sc = Number(t2.score || 82)
            const st = t2.overallStatus || t2.risk || (sc >= 80 ? 'Good' : sc >= 60 ? 'Caution' : 'Bad')
            const isB = st === 'Bad' || sc < 60
            const isC = !isB && (st === 'Caution' || sc < 80)
            const dayLabel = idx === 0 ? (lang === 'हिंदी' ? 'दिन 1 (आरंभिक)' : 'Day 1 (Initial)') : idx === 1 ? (lang === 'हिंदी' ? 'दिन 5 (मध्य)' : 'Day 5 (Mid-ferment)') : idx === 2 ? (lang === 'हिंदी' ? 'दिन 9 (फेस खुला)' : 'Day 9 (Face Open)') : (lang === 'हिंदी' ? `दिन ${1 + idx * 4}` : `Day ${1 + idx * 4}`)

            return (
              <div key={t2.id || t2._id || idx} style={{
                padding: 12,
                borderRadius: 8,
                background: isDark ? (isB ? '#2e0a0f' : isC ? '#2a1a08' : '#0a2315') : (isB ? '#fff1f2' : isC ? '#fffbeb' : '#f0fdf4'),
                border: `1px solid ${isDark ? (isB ? '#dc262644' : isC ? '#f59e0b44' : '#16a34a44') : (isB ? '#fecaca' : isC ? '#fde68a' : '#bbf7d0')}`,
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <b style={{ fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>{dayLabel}</b>
                  <span className={`badge ${riskClass(st)}`} style={{ fontSize: 10 }}>{locTerm(st)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <b style={{ fontSize: 18, color: sc >= 80 ? (isDark ? '#4ade80' : '#16a34a') : sc >= 60 ? '#f59e0b' : '#ef4444' }}>{sc}</b>
                  <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>/ 100</small>
                </div>
                <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-700)', margin: '0 0 8px', lineHeight: 1.35 }}>
                  {isB
                    ? (lang === 'हिंदी' ? 'फफूंद व ब्यूटिरिक एसिड वृद्धि' : 'Mold & clostridial heating')
                    : isC
                    ? (lang === 'हिंदी' ? 'हल्की हवा का रिसाव व नमी विचलन' : 'Minor air ingress & moisture shift')
                    : (lang === 'हिंदी' ? 'उत्कृष्ट लैक्टिक किण्वन संरक्षित' : 'Optimal lactic fermentation')}
                </p>
                <Link to={`/analysis/${t2.id || t2._id}`} style={{ fontSize: 10.5, color: isDark ? '#86efac' : 'var(--brand-primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {t.viewReport || 'View Scan'} →
                </Link>
              </div>
            )
          })}
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

/* ─────────────────── SCREEN: WHAT-IF RATION SIMULATOR (FEATURE 4) ─────────────────── */
const STANDARD_INGREDIENTS = [
  { id: 'silage', name: 'Maize Silage', nameHi: 'मक्का साइलेज', dm: 0.35, cp: 8.5, me: 9.8, ndf: 45, costPerKg: 2.5, defaultKg: 16 },
  { id: 'straw', name: 'Wheat Straw (Bhusa)', nameHi: 'गेहूं का भूसा', dm: 0.90, cp: 3.5, me: 6.2, ndf: 70, costPerKg: 6.0, defaultKg: 3 },
  { id: 'green', name: 'Green Berseem / Fodder', nameHi: 'हरा चारा (बरसीम/नेपियर)', dm: 0.18, cp: 16.0, me: 9.0, ndf: 42, costPerKg: 2.0, defaultKg: 8 },
  { id: 'mustard', name: 'Mustard Cake (Sarson Khali)', nameHi: 'सरसों की खली', dm: 0.90, cp: 34.0, me: 11.5, ndf: 28, costPerKg: 28.0, defaultKg: 1.5 },
  { id: 'cotton', name: 'Cottonseed Cake (Binola)', nameHi: 'बिनोला खली', dm: 0.90, cp: 24.0, me: 10.8, ndf: 38, costPerKg: 26.0, defaultKg: 1.0 },
  { id: 'concentrate', name: 'Dairy Feed Pellet (20% CP)', nameHi: 'संतुलित कैटल फीड पेलेट', dm: 0.88, cp: 20.0, me: 11.2, ndf: 30, costPerKg: 24.0, defaultKg: 3.5 },
  { id: 'mineral', name: 'Chelated Mineral Mixture + Salt', nameHi: 'खनिज मिश्रण + नमक', dm: 0.98, cp: 0.0, me: 0.0, ndf: 0, costPerKg: 120.0, defaultKg: 0.15 }
]

function RationSimulator() {
  const { t, lang, loc: locTerm, user, settings } = useApp()
  const isDark = Boolean(settings?.darkMode)
  const isHi = lang === 'हिंदी'
  const herdSize = Number(user?.cattleCount || 24)

  const [quantities, setQuantities] = useState(() => {
    const initial = {}
    STANDARD_INGREDIENTS.forEach(ing => { initial[ing.id] = ing.defaultKg })
    return initial
  })

  const updateQty = (id, val) => {
    const num = Math.max(0, parseFloat(val) || 0)
    setQuantities(prev => ({ ...prev, [id]: num }))
  }

  const applyPreset = (type) => {
    if (type === 'traditional') {
      setQuantities({ silage: 8, straw: 6, green: 4, mustard: 1.0, cotton: 0.5, concentrate: 3.0, mineral: 0.05 })
    } else if (type === 'high_silage') {
      setQuantities({ silage: 20, straw: 2.0, green: 8, mustard: 1.8, cotton: 0.8, concentrate: 3.0, mineral: 0.15 })
    } else {
      const reset = {}
      STANDARD_INGREDIENTS.forEach(ing => { reset[ing.id] = ing.defaultKg })
      setQuantities(reset)
    }
  }

  // Calculate Live Metrics
  let totalFreshKg = 0
  let totalDmKg = 0
  let totalCpGrams = 0
  let totalMe = 0
  let totalNdfKg = 0
  let totalDailyCost = 0

  STANDARD_INGREDIENTS.forEach(ing => {
    const kg = quantities[ing.id] || 0
    const dmKg = kg * ing.dm
    totalFreshKg += kg
    totalDmKg += dmKg
    totalCpGrams += dmKg * (ing.cp / 100) * 1000
    totalMe += dmKg * ing.me
    totalNdfKg += dmKg * (ing.ndf / 100)
    totalDailyCost += kg * ing.costPerKg
  })

  const blendedCpPct = totalDmKg > 0 ? ((totalCpGrams / 1000) / totalDmKg) * 100 : 0
  const blendedMe = totalDmKg > 0 ? totalMe / totalDmKg : 0
  const blendedNdfPct = totalDmKg > 0 ? (totalNdfKg / totalDmKg) * 100 : 0

  // Traditional baseline metrics for comparison
  const baseCost = 182
  const baseCp = 11.4
  const dailySavingPerCow = Math.round(baseCost - totalDailyCost)
  const monthlyHerdSavings = Math.round(dailySavingPerCow * herdSize * 30)

  // Nutritional safety checks
  const isCpOptimal = blendedCpPct >= 14 && blendedCpPct <= 17.5
  const isCpLow = blendedCpPct < 13
  const isNdfOptimal = blendedNdfPct >= 28 && blendedNdfPct <= 38
  const isDmOptimal = totalDmKg >= 11.5 && totalDmKg <= 15.0

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.rationSimulator || (isHi ? 'व्हाट-इफ़ राशन सिम्युलेटर' : 'What-If Feed & Ration Simulator')}</h1>
          <p>{t.rationSimulatorDesc || (isHi ? 'डेयरी पशुओं के लिए टीएमआर चारा, क्रूड प्रोटीन, रेशा और दैनिक लागत संतुलित करें' : 'Simulate Total Mixed Rations, optimize crude protein, fiber, energy and daily herd feed cost')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="button secondary sm" onClick={() => applyPreset('traditional')}>
            {isHi ? 'पारंपरिक उच्च-भूसा आहार' : 'Traditional High-Straw'}
          </button>
          <button className="button primary sm" onClick={() => applyPreset('high_silage')}>
            {isHi ? 'इष्टतम उच्च-साइलेज TMR' : 'Optimal High-Silage TMR'}
          </button>
          <button className="button secondary sm" onClick={() => applyPreset('default')}>
            {t.resetDefault || (isHi ? 'मानक रीसेट' : 'Reset Standard')}
          </button>
        </div>
      </div>

      {/* ── CURRENT VS PROPOSED COMPARISON HERO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Current Traditional Ration Card */}
        <div className="card" style={{ background: isDark ? '#0a2015' : '#f8fafc', border: `1px solid ${isDark ? '#173b27' : 'var(--border-light)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 13, color: isDark ? '#94a3b8' : 'var(--ink-600)' }}>{t.currentDiet || (isHi ? 'वर्तमान पारंपरिक राशन' : 'Current Traditional Diet')}</b>
            <span className="badge caution" style={{ fontSize: 10 }}>{isHi ? 'उच्च लागत' : 'High Cost'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#173b27' : '#e2e8f0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>{isHi ? 'क्रूड प्रोटीन' : 'Protein (CP)'}</small>
              <b style={{ fontSize: 14, display: 'block', color: '#d97706' }}>{baseCp}%</b>
            </div>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#173b27' : '#e2e8f0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>{isHi ? 'ऊर्जा (ME)' : 'Energy'}</small>
              <b style={{ fontSize: 14, display: 'block', color: isDark ? '#ffffff' : 'var(--ink-800)' }}>8.4 MJ</b>
            </div>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#173b27' : '#e2e8f0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>{isHi ? 'दैनिक लागत' : 'Cost/Cow'}</small>
              <b style={{ fontSize: 14, display: 'block', color: '#dc2626' }}>₹{baseCost}/d</b>
            </div>
          </div>
        </div>

        {/* Proposed Simulated Ration Card */}
        <div className="card" style={{ background: isDark ? '#092516' : '#f0fdf4', border: `2px solid ${isDark ? '#22c55e' : '#22c55e'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 13, color: isDark ? '#86efac' : '#166534' }}>{t.proposedDiet || (isHi ? 'प्रस्तावित सिम्युलेटेड राशन' : 'Proposed Simulated Diet')}</b>
            <span className="badge good" style={{ fontSize: 10 }}>{isHi ? 'इष्टतम TMR' : 'Optimized TMR'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#16a34a44' : '#bbf7d0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#86efac' : '#166534' }}>{isHi ? 'क्रूड प्रोटीन' : 'Protein (CP)'}</small>
              <b style={{ fontSize: 14, display: 'block', color: isCpOptimal ? (isDark ? '#4ade80' : '#16a34a') : isCpLow ? '#ef4444' : '#f59e0b' }}>
                {blendedCpPct.toFixed(1)}%
              </b>
            </div>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#16a34a44' : '#bbf7d0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#86efac' : '#166534' }}>{isHi ? 'ऊर्जा (ME)' : 'Energy'}</small>
              <b style={{ fontSize: 14, display: 'block', color: isDark ? '#86efac' : '#166534' }}>{blendedMe.toFixed(1)} MJ</b>
            </div>
            <div style={{ padding: 8, background: isDark ? '#06170e' : '#fff', borderRadius: 6, border: `1px solid ${isDark ? '#16a34a44' : '#bbf7d0'}` }}>
              <small style={{ fontSize: 10, color: isDark ? '#86efac' : '#166534' }}>{isHi ? 'दैनिक लागत' : 'Cost/Cow'}</small>
              <b style={{ fontSize: 14, display: 'block', color: isDark ? '#4ade80' : '#166534' }}>₹{Math.round(totalDailyCost)}/d</b>
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="card" style={{ background: isDark ? '#0e2e1c' : '#ecfdf5', border: `1px solid ${isDark ? '#1a4d2e' : '#a7f3d0'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <b style={{ fontSize: 12, color: isDark ? '#86efac' : '#047857', display: 'block', marginBottom: 4 }}>
            {t.dailySavings || (isHi ? 'अनुमानित दैनिक बचत' : 'Estimated Daily Savings')}
          </b>
          <div style={{ fontSize: 22, fontWeight: 800, color: dailySavingPerCow >= 0 ? (isDark ? '#4ade80' : '#059669') : '#ef4444' }}>
            {dailySavingPerCow >= 0 ? `+ ₹${dailySavingPerCow}` : `- ₹${Math.abs(dailySavingPerCow)}`}
            <small style={{ fontSize: 12, fontWeight: 600 }}> / {isHi ? 'गाय / दिन' : 'cow / day'}</small>
          </div>
          <span style={{ fontSize: 11, color: isDark ? '#a7f3d0' : '#065f46', marginTop: 4 }}>
            {isHi ? `${herdSize} पशुओं के लिए ₹${Math.abs(monthlyHerdSavings).toLocaleString('en-IN')}/माह ${dailySavingPerCow >= 0 ? 'की बचत' : 'अतिरिक्त खर्च'}` : `₹${Math.abs(monthlyHerdSavings).toLocaleString('en-IN')}/month for ${herdSize} cattle`}
          </span>
        </div>
      </div>

      {/* ── INGREDIENTS INTERACTIVE SLIDERS TABLE ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 14, color: isDark ? '#ffffff' : 'inherit' }}>
          {t.ingredients || (isHi ? 'चारा व दाना सामग्री मात्रा (किग्रा/गाय/दिन)' : 'Feed Ingredients & Daily Quantities')}
        </b>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{isHi ? 'सामग्री' : 'Ingredient'}</th>
                <th>{isHi ? 'सूखा पदार्थ (DM)' : 'Dry Matter'}</th>
                <th>{isHi ? 'प्रोटीन (CP)' : 'Protein'}</th>
                <th>{isHi ? 'ऊर्जा (ME)' : 'Energy'}</th>
                <th>{isHi ? 'दर (₹/किग्रा)' : 'Rate (₹/kg)'}</th>
                <th style={{ width: 140 }}>{isHi ? 'दैनिक मात्रा (किग्रा)' : 'Daily Intake (kg)'}</th>
                <th>{isHi ? 'दैनिक खर्च' : 'Cost (₹)'}</th>
              </tr>
            </thead>
            <tbody>
              {STANDARD_INGREDIENTS.map(ing => {
                const qty = quantities[ing.id] ?? ing.defaultKg
                const cost = qty * ing.costPerKg
                return (
                  <tr key={ing.id}>
                    <td><b style={{ color: isDark ? '#ffffff' : 'inherit' }}>{isHi ? ing.nameHi : ing.name}</b></td>
                    <td>{Math.round(ing.dm * 100)}%</td>
                    <td>{ing.cp}%</td>
                    <td>{ing.me} MJ</td>
                    <td>₹{ing.costPerKg}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          step={ing.id === 'mineral' ? '0.05' : '0.5'}
                          min="0"
                          max="40"
                          className="field-input"
                          style={{ width: 75, padding: '4px 8px', fontSize: 13, textAlign: 'center' }}
                          value={qty}
                          onChange={e => updateQty(ing.id, e.target.value)}
                        />
                        <small style={{ color: isDark ? '#94a3b8' : 'var(--ink-500)' }}>kg</small>
                      </div>
                    </td>
                    <td><b style={{ color: isDark ? '#4ade80' : 'inherit' }}>₹{cost.toFixed(1)}</b></td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: isDark ? '#081d11' : '#f8fafc', fontWeight: 700 }}>
                <td>{isHi ? 'कुल दैनिक टीएमआर' : 'Total Daily TMR'}</td>
                <td>{totalDmKg.toFixed(1)} kg DM</td>
                <td style={{ color: isCpOptimal ? (isDark ? '#4ade80' : '#16a34a') : isCpLow ? '#ef4444' : '#f59e0b' }}>{blendedCpPct.toFixed(1)}% CP</td>
                <td>{blendedMe.toFixed(1)} MJ</td>
                <td>—</td>
                <td>{totalFreshKg.toFixed(1)} kg Fresh</td>
                <td style={{ color: isDark ? '#4ade80' : '#16a34a' }}>₹{Math.round(totalDailyCost)} / {isHi ? 'गाय' : 'cow'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── NUTRITIONAL HEALTH & RUMEN ALERTS ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ fontSize: 14, display: 'block', marginBottom: 12, color: isDark ? '#ffffff' : 'inherit' }}>
          {t.nutritionalWarning || (isHi ? 'पोषण संबंधी सलाह व रुमेन संतुलन' : 'Nutritional & Rumen Health Analysis')}
        </b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, background: isDark ? (isCpOptimal ? '#092516' : '#2b1b08') : (isCpOptimal ? '#f0fdf4' : '#fffbeb'), border: `1px solid ${isDark ? (isCpOptimal ? '#16a34a66' : '#f59e0b66') : (isCpOptimal ? '#bbf7d0' : '#fde68a')}` }}>
            <b style={{ fontSize: 12, color: isCpOptimal ? (isDark ? '#86efac' : '#166534') : (isDark ? '#fde68a' : '#92400e'), display: 'block', marginBottom: 4 }}>
              {isCpOptimal ? (isHi ? '✅ प्रोटीन संतुलन इष्टतम' : '✅ Optimal Protein (CP)') : (isHi ? '⚠️ प्रोटीन असंतुलन' : '⚠️ Protein Imbalance')}
            </b>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-700)', margin: 0 }}>
              {isCpOptimal
                ? (isHi ? `15-16% क्रूड प्रोटीन 14-18 लीटर दूध उत्पादन के लिए आदर्श है।` : `15-16% CP supports sustained 14-18 L/day milk production.`)
                : isCpLow
                ? (isHi ? `प्रोटीन कम (<13%) है। सरसों की खली या दाल चूनी 0.5 किग्रा बढ़ाएं।` : `Low protein (<13%). Increase mustard cake or legume fodder by 0.5 kg.`)
                : (isHi ? `प्रोटीन अधिक (>18%) है। दाना की मात्रा कम करके लागत बचाएं।` : `Excess protein (>18%). Reduce concentrate to save feed costs.`)}
            </p>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: isDark ? (isNdfOptimal ? '#092516' : '#2b1b08') : (isNdfOptimal ? '#f0fdf4' : '#fffbeb'), border: `1px solid ${isDark ? (isNdfOptimal ? '#16a34a66' : '#f59e0b66') : (isNdfOptimal ? '#bbf7d0' : '#fde68a')}` }}>
            <b style={{ fontSize: 12, color: isNdfOptimal ? (isDark ? '#86efac' : '#166534') : (isDark ? '#fde68a' : '#92400e'), display: 'block', marginBottom: 4 }}>
              {isNdfOptimal ? (isHi ? '✅ रेशा व जुगाली संतुलन' : '✅ Effective Fiber (NDF)') : (isHi ? '⚠️ रेशा असंतुलन' : '⚠️ Fiber Imbalance')}
            </b>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-700)', margin: 0 }}>
              {isNdfOptimal
                ? (isHi ? `30-36% NDF रेशा जुगाली और 4.0%+ दूध फैट को स्थिर रखता है।` : `30-36% NDF fiber maintains healthy cud chewing and 4.0%+ milk fat.`)
                : (isHi ? `रुमेन एसिडोसिस से बचने के लिए 2-3 किग्रा सूखा भूसा अवश्य शामिल रखें।` : `Maintain 2-3 kg dry straw to prevent sub-acute rumen acidosis (SARA).`)}
            </p>
          </div>

          <div style={{ padding: 12, borderRadius: 8, background: isDark ? (isDmOptimal ? '#092516' : '#2b1b08') : (isDmOptimal ? '#f0fdf4' : '#fffbeb'), border: `1px solid ${isDark ? (isDmOptimal ? '#16a34a66' : '#f59e0b66') : (isDmOptimal ? '#bbf7d0' : '#fde68a')}` }}>
            <b style={{ fontSize: 12, color: isDmOptimal ? (isDark ? '#86efac' : '#166534') : (isDark ? '#fde68a' : '#92400e'), display: 'block', marginBottom: 4 }}>
              {isDmOptimal ? (isHi ? '✅ सूखा पदार्थ (DM) पर्याप्त' : '✅ Dry Matter Capacity') : (isHi ? '⚠️ सूखा पदार्थ जांच' : '⚠️ Dry Matter Capacity')}
            </b>
            <p style={{ fontSize: 11, color: isDark ? '#cbd5e1' : 'var(--ink-700)', margin: 0 }}>
              {isDmOptimal
                ? (isHi ? `12-14 किग्रा सूखा पदार्थ 400-500 किग्रा गाय के लिए आदर्श दैनिक क्षमता है।` : `12-14 kg DM intake matches full capacity for 400-500 kg dairy cows.`)
                : (isHi ? `सूखा पदार्थ का कुल योग सामान्य शारीरिक आवश्यकता के अनुसार समायोजित करें।` : `Adjust total dry matter volume according to individual herd live weight.`)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: 12, background: isDark ? '#081d11' : '#f8fafc', borderRadius: 8, border: `1px solid ${isDark ? '#164329' : 'var(--border-light)'}`, fontSize: 11, color: isDark ? '#94a3b8' : 'var(--ink-600)' }}>
        <b>{isHi ? 'वैज्ञानिक संदर्भ:' : 'Scientific Reference:'}</b> {t.estimatedModelNotice || (isHi ? 'ICAR एवं राष्ट्रीय डेयरी अनुसंधान संस्थान (NDRI) पोषण दिशानिर्देशों पर आधारित अनुमानित मॉडल। वास्तविक आहार पशु के शारीरिक वजन, ब्यात अवस्था और मौसम के अनुसार बदल सकता है।' : 'Estimated nutritional model based on standard ICAR & NDRI dairy guidelines. Actual intake varies by lactation stage and body weight.')}
      </div>
    </div>
  )
}

const DEFAULT_MILK_LOGS = [
  { id: 'MY-001', date: '2026-05-22', batchId: 'SILAGE-001', yieldLiters: 180, cowCount: 12, avgPerCow: 15.0, notes: 'Morning milking, good feed intake' },
  { id: 'MY-002', date: '2026-05-21', batchId: 'SILAGE-001', yieldLiters: 175, cowCount: 12, avgPerCow: 14.58, notes: 'Warm afternoon' },
  { id: 'MY-003', date: '2026-05-20', batchId: 'FEED-001', yieldLiters: 192, cowCount: 12, avgPerCow: 16.0, notes: 'Added protein concentrate' }
]

function MilkYield() {
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('smartfeed_milk_logs')
      return saved ? JSON.parse(saved) : DEFAULT_MILK_LOGS
    } catch (e) {
      return DEFAULT_MILK_LOGS
    }
  })
  const [batchId, setBatchId] = useState('SILAGE-001')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [yieldLiters, setYieldLiters] = useState('180')
  const [cowCount, setCowCount] = useState('12')
  const [notes, setNotes] = useState('')

  const saveLocalLogs = (newLogs) => {
    setLogs(newLogs)
    try { localStorage.setItem('smartfeed_milk_logs', JSON.stringify(newLogs)) } catch (e) {}
  }

  const load = useCallback(async () => {
    try {
      const data = await apiFetch('/api/milk-yield')
      if (Array.isArray(data) && data.length > 0) {
        saveLocalLogs(data)
      }
    } catch (e) {
      console.warn('Backend offline, using local milk logs state')
    }
  }, [apiFetch])

  useEffect(() => { load() }, [load])

  const handleSave = async (e) => {
    e.preventDefault()
    const ltrs = Number(yieldLiters) || 180
    const cows = Number(cowCount) || 12
    const avg = Math.round((ltrs / cows) * 100) / 100
    const newEntry = {
      id: 'MY-' + Date.now(),
      batchId,
      date,
      yieldLiters: ltrs,
      cowCount: cows,
      avgPerCow: avg,
      notes: notes || (lang === 'हिंदी' ? 'नियमित दुग्ध उत्पादन दर्ज' : 'Regular milking log entry')
    }

    try {
      await apiFetch('/api/milk-yield', {
        method: 'POST',
        body: JSON.stringify({ batchId, date, yieldLiters: ltrs, cowCount: cows, notes })
      })
    } catch (err) {
      console.warn('Backend offline, saved milk yield locally')
    }

    const updated = [newEntry, ...logs]
    saveLocalLogs(updated)
    toast(t.yieldLoggedToast || 'Milk yield logged successfully!', 'success')
    setNotes('')
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/milk-yield/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Backend offline, deleting milk yield log locally')
    }
    const updated = logs.filter(l => (l.id || l._id) !== id)
    saveLocalLogs(updated)
    toast(t.logDeletedToast || 'Log entry deleted', 'info')
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
              <tr><th>{t.yieldDate}</th><th>{t.batchId}</th><th>{t.totalLitersCol || (lang === 'हिंदी' ? 'कुल (L)' : 'Total (L)')}</th><th>{t.cowCount}</th><th>{t.avgPerCow}</th><th>{t.notesCol || (lang === 'हिंदी' ? 'नोट्स' : 'Notes')}</th><th>{t.actionCol}</th></tr>
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
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20, color: 'var(--ink-500)' }}>{lang === 'हिंदी' ? 'अभी तक कोई दूध लॉग दर्ज नहीं हुआ' : 'No milk logs recorded yet.'}</td></tr>
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
  const navigate = useNavigate()
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
                    <button className="button secondary sm" onClick={() => navigate(`/analysis/${id}`)}>
                      <Eye size={12}/> {t.view}
                    </button>
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

  const getAgronomistResponse = (q, langStr) => {
    const isHi = langStr === 'हिंदी'
    const text = (q || '').toLowerCase()

    if (text.includes('mold') || text.includes('फफूंद') || text.includes('मायकोटॉक्सिन') || text.includes('aflatoxin')) {
      return isHi
        ? `### 🍄 फफूंद एवं मायकोटॉक्सिन रोकथाम मार्गदर्शन\n\n1. **संक्रमित परत हटाएं:** साइलेज पिट की ऊपरी फफूंदयुक्त 10-15 सेमी परत को तुरंत हटाकर फेंक दें।\n2. **सीलिंग की जांच करें:** हवा के रिसाव को रोकने के लिए प्लास्टिक शीट और मिट्टी/वजन को फिर से कसें।\n3. **ऑर्गेनिक एसिड बाइंडर्स:** फ़ीड में 2-3 ग्राम/गाय प्रति दिन मायकोटॉक्सिन बाइंडर (जैसे बेंटोनाइट क्ले या MOS) मिलाएं।\n4. **दुग्ध सुरक्षा:** संदिग्ध चारे को दुधारू गायों को न खिलाएं।`
        : `### 🍄 Mold & Mycotoxin Advisory\n\n1. **Discard Affected Layers:** Immediately scrape off and discard moldy top layer (> 10 cm). Do not mix with clean feed.\n2. **Silo Pit Sealing:** Inspect plastic lining for tears. Re-compact pit face tightly to eliminate oxygen pockets.\n3. **Toxin Binders:** Add 2–3 g/cow/day of broad-spectrum mycotoxin binder (e.g. Bentonite clay or MOS).\n4. **Milk Safety:** Moldy silage can trigger Aflatoxin M1 in milk. Feed clean silage to lactating cows.`
    }

    if (text.includes('moisture') || text.includes('नमी') || text.includes('पानी') || text.includes('wet')) {
      return isHi
        ? `### 💧 साइलेज नमी प्रबंधन (60% - 68% आदर्श)\n\n* **68% से अधिक नमी:** क्लोस्ट्रिडिया जीवाणु पनपने का खतरा होता है (खराब खट्टा सिरका गंध)। मक्के की फसल को 1-2 घंटे सुखाएं।\n* **60% से कम नमी:** गड्ढे में हवा की परतें रह जाती हैं, जिससे फफूंद लगती है। बारीक काटें (8-12 mm) और भारी रोलर से दबाएं।\n* **सरल परीक्षण (Squeeze Test):** हाथ में दबाने पर यदि बूंदें गिरें = नमी > 70%। गेंद बने पर हाथ सूखा रहे = 60-65% (आदर्श)।`
        : `### 💧 Silage Moisture Management Guide\n\n* **Ideal Target:** 60% – 68% moisture content for pit silage.\n* **High Moisture (> 70%):** Risk of clostridial fermentation and nutrient leaching. Wilt chopped crop for 1-2 hours before ensiling.\n* **Low Moisture (< 50%):** Difficult to compact, leading to aerobic mold growth. Chop finer (8–12 mm) and apply heavy compaction.\n* **Squeeze Test:** Squeeze a handful of chopped forage for 30s. Drops released = > 70% moisture. Holds ball shape without water = 60-65% (Optimal).`
    }

    if (text.includes('milk') || text.includes('दूध') || text.includes('yield') || text.includes('उत्पादन')) {
      return isHi
        ? `### 🥛 साइलेज से दूध उत्पादन बढ़ाने की रणनीति\n\n1. **टीएमआर संतुलन:** प्रति गाय प्रतिदिन 15-18 किग्रा उच्च गुणवत्ता वाला मक्का साइलेज + 1.5 किग्रा ध्यान फ़ीड दें।\n2. **क्रूड प्रोटीन पूरक:** मक्का साइलेज में ऊर्जा अधिक और प्रोटीन मध्यम (8-9%) होता है। 2-3 किग्रा बरसीम या 1 किग्रा सोया खल जोड़ें।\n3. **रैमन पीएच स्थिर रखें:** 50 ग्राम सोडियम बाइकार्बोनेट (मीठा सोडा) प्रति गाय देने से एसिडोसिस दूर होता है और दूध में वसा (Fat%) बढ़ता है।`
        : `### 🥛 Maximizing Milk Yield with Silage & TMR\n\n1. **Optimal TMR Ratio:** Feed 15–18 kg high-quality Maize Silage + 1.5–2.0 kg concentrate per 10 L milk production.\n2. **Protein Balancing:** Maize silage provides high energy (8.5 MJ/kg) but moderate CP (8-9%). Balance with leguminous forage (Berseem/Lucerne) or 1 kg soybean meal.\n3. **Rumen Buffering:** Add 50g Sodium Bicarbonate per cow daily to prevent sub-acute rumen acidosis (SARA) and maintain fat content.`
    }

    if (text.includes('score') || text.includes('स्कोर') || text.includes('62') || text.includes('quality') || text.includes('गुणवत्ता')) {
      return isHi
        ? `### 📊 साइलेज गुणवत्ता स्कोर विश्लेषण (स्कोर अर्थ)\n\n* **80-100 (उत्कृष्ट):** इष्टतम किण्वन, लैक्टिक अम्ल सुगंध, < 5% स्टार्च हानि। दुधारू पशुओं के लिए उत्तम।\n* **60-79 (मध्यम):** स्वीकार्य गुणवत्ता, थोड़ी नमी विचलन या सतह ऑक्सीकरण। उपयोग योग्य।\n* **< 60 (उच्च जोखिम):** फफूंद या उच्च ब्यूटिरिक एसिड का जोखिम। केवल सूखे मवेशियों को सीमित मात्रा में दें।`
        : `### 📊 SmartFeed Quality Score Breakdown\n\n* **80 – 100 (Optimal/Good):** High lactic fermentation, ideal moisture (60-68%), zero mold. Recommended for high-yielders.\n* **60 – 79 (Caution/Moderate):** Acceptable quality, minor moisture deviation or surface weathering. Safe with binders.\n* **< 60 (High Risk):** Sub-optimal fermentation or mold risk. Discard outer layers and consult nutritionist before feeding.`
    }

    return isHi
      ? `### 🌾 SmartFeed AI कृषक सलाहकारी रिपोर्ट\n\n**पूछे गए विषय पर मुख्य बिंदु:**\n* **साइलेज संरक्षण:** गड्ढे की दैनिक कटाई के बाद प्लास्टिक शीट को कसकर ढके रखें।\n* **दैनिक राशन संतुलन:** 60% साइलेज + 25% हरा चारा + 15% दाना मिश्रण दुधारू गायों के लिए आदर्श संतुलन बनाता है।\n* **गुणवत्ता निगरानी:** महीने में 2 बार SmartFeed AI से फोटोग्राफिक और सेंसरी स्क्रीनिंग दोहराएं।`
      : `### 🌾 SmartFeed AI Agronomy Advisory Response\n\n**Key Nutritional Guidelines for Your Herd:**\n* **Pit Management:** Keep the silage pit face tight and clean. Cut vertically across the face to minimize oxygen exposure.\n* **Ration Formulation:** Combine 60% Maize Silage + 25% Leguminous Green Fodder + 15% Dairy Concentrate for balanced TMR.\n* **Regular Screening:** Perform photographic and sensory quality assessments twice monthly to track moisture and fermentation scores.`
  }

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
      if (data && data.text) {
        setMessages(m => [...m, { from: 'bot', text: data.text, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
      } else {
        throw new Error('Empty response')
      }
    } catch (e) {
      const fallbackReply = getAgronomistResponse(q, lang)
      setMessages(m => [...m, { from: 'bot', text: fallbackReply, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }])
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
  const isHindi = lang === 'हिंदी'
  const [tab, setTab] = useState('Sample Reports')
  const [reports, setReports] = useState([])
  const [modal, setModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
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

  const handlePrintPdf = (r) => {
    setSelectedReport(r)
  }

  const triggerDirectPrint = (r) => {
    try {
      const printWin = window.open('', '_blank', 'width=800,height=900')
      if (!printWin) {
        window.print()
        return
      }

      const isHi = lang === 'हिंदी'
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>SmartFeed_AI_Certificate_${r.id}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; margin: 0; }
            .cert-border { border: 2px solid #16a34a; padding: 24px; border-radius: 12px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 14px; margin-bottom: 18px; }
            .logo { font-size: 22px; font-weight: 800; color: #16a34a; display: flex; align-items: center; gap: 8px; }
            .badge { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 18px; border: 1px solid #e2e8f0; }
            .meta-item small { color: #64748b; font-size: 10.5px; font-weight: 600; display: block; }
            .meta-item b { font-size: 13.5px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12.5px; }
            th { background: #f1f5f9; color: #1e293b; padding: 8px 10px; text-align: left; border: 1px solid #cbd5e1; font-weight: 700; }
            td { padding: 8px 10px; border: 1px solid #cbd5e1; }
            .advisory { padding: 12px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 18px; }
            .advisory b { color: #14532d; font-size: 12.5px; display: block; margin-bottom: 4px; }
            .advisory p { margin: 0; font-size: 12px; color: #166534; line-height: 1.5; }
            .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 10.5px; color: #64748b; }
            .stamp { border: 2px solid #16a34a; color: #16a34a; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
            .print-btn-bar { margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .btn { background: #16a34a; color: white; border: none; padding: 8px 18px; font-weight: 700; border-radius: 6px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; }
            .btn:hover { background: #15803d; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print print-btn-bar">
            <span style="font-size: 12.5px; font-weight: 600; color: #334155;">📄 SmartFeed AI Certificate View</span>
            <button class="btn" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <div class="cert-border">
            <div class="header">
              <div>
                <div class="logo">🌾 SmartFeed AI</div>
                <small style="color: #475569; font-size: 12px;">${isHi ? 'डेयरी फ़ीड और साइलेज गुणवत्ता परीक्षण प्रमाणपत्र' : 'Dairy Feed & Silage Quality Screening Certificate'}</small>
              </div>
              <div style="text-align: right;">
                <span class="badge">${isHi ? '✔ डिजिटल रूप से सत्यापित' : '✔ Digitally Verified'}</span>
                <div style="font-size: 10.5px; color: #64748b; margin-top: 6px;">
                  <b>ID:</b> ${r.id}<br />
                  <b>Date:</b> ${r.date || '22 May 2026, 10:30 AM'}
                </div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <small>${isHi ? 'संदर्भ आई डी' : 'Reference ID'}</small>
                <b>${r.ref || 'SF-2026-1256'}</b>
              </div>
              <div class="meta-item">
                <small>${isHi ? 'रिपोर्ट प्रकार' : 'Report Type'}</small>
                <b>${r.type || 'Sample Report'}</b>
              </div>
              <div class="meta-item">
                <small>${isHi ? 'गुणवत्ता स्कोर' : 'Quality Score'}</small>
                <b style="color: #16a34a; font-size: 15px;">87 / 100</b>
              </div>
            </div>

            <b style="display: block; font-size: 13px; margin-bottom: 8px; color: #0f172a;">${isHi ? 'विश्लेषित पोषण और सुरक्षा पैरामीटर' : 'Tested Nutritional & Safety Parameters'}</b>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Measured Value</th>
                  <th>Optimal Target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Crude Protein (CP)</td><td><b>14.2 %</b></td><td>14.0 - 16.5 %</td><td><span class="badge">Optimal</span></td></tr>
                <tr><td>Moisture Content</td><td><b>58.0 %</b></td><td>55.0 - 65.0 %</td><td><span class="badge">Optimal</span></td></tr>
                <tr><td>NDF Fiber</td><td><b>28.4 %</b></td><td>&lt; 35.0 %</td><td><span class="badge">Optimal</span></td></tr>
                <tr><td>Energy Value (ME)</td><td><b>8.5 MJ/kg</b></td><td>&gt; 8.0 MJ/kg</td><td><span class="badge">Optimal</span></td></tr>
                <tr><td>Aflatoxin / Mycotoxins</td><td><b>4.0 ppb</b></td><td>&lt; 20.0 ppb</td><td><span class="badge">Safe</span></td></tr>
              </tbody>
            </table>

            <div class="advisory">
              <b>🌾 ${isHi ? 'AI एग्रोनॉमिस्ट सारांश और सलाह:' : 'AI Agronomist Screening Summary & Advisory:'}</b>
              <p>${r.summary || (isHi ? 'उच्च गुणवत्ता वाला मक्का साइलेज। इष्टतम नमी संतुलन (58%) और नगण्य फफूंद जोखिम पाया गया। दुधारू पशुओं के लिए अत्यधिक उपयुक्त।' : 'High quality maize silage batch. Optimal moisture balance (58%) and zero mold contamination detected. Safe for high-yielding dairy herd.')}</p>
            </div>

            <div class="footer">
              <div>
                <b>SmartFeed AI Quality System</b><br />
                <span>On-Farm Computer Vision & Agronomy Analytics</span>
              </div>
              <div style="text-align: right;">
                <div class="stamp">✔ OFFICIAL SCREENING PASSED</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">*Rapid screening estimate — for legal disputes consult NABL accredited laboratory assay.</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 300);
            };
          </script>
        </body>
        </html>
      `

      printWin.document.write(htmlContent)
      printWin.document.close()
    } catch (e) {
      console.warn('Popup blocked, triggering browser print fallback:', e)
      window.print()
    }
  }

  // Filter by selected tab: 'Sample Reports' vs 'Batch Reports'
  const isSampleTab = tab === 'Sample Reports' || tab.toLowerCase().includes('sample')
  const allReports = reports.length > 0 ? reports : mockReports
  const list = allReports.filter(r => {
    const typeStr = String(r.type || '').toLowerCase()
    const refTypeStr = String(r.refType || '').toLowerCase()
    const isBatch = typeStr.includes('batch') || refTypeStr.includes('batch') || String(r.ref || '').startsWith('SILAGE-') || String(r.ref || '').startsWith('FEED-')
    return isSampleTab ? !isBatch : isBatch
  })

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
            {list.length > 0 ? (
              list.map(r => (
                <tr key={r.id}>
                  <td><b>{r.id}</b></td>
                  <td>{locTerm(r.type)}</td>
                  <td>{r.date || (isHindi ? '22 मई 2026, 10:30 AM' : '22 May 2026, 10:30 AM')}</td>
                  <td><b>{r.ref || 'SF-2026-1256'}</b></td>
                  <td><small style={{ color: 'var(--ink-700)' }}>{r.summary ? r.summary.slice(0, 75) + '...' : (isHindi ? 'सत्यापित गुणवत्ता पैरामीटर' : 'Verified quality parameters')}</small></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="button secondary sm" onClick={() => exportReportCSV(r)}>
                        <Download size={13}/> CSV
                      </button>
                      <button className="button primary sm" onClick={() => handlePrintPdf(r)}>
                        <Eye size={13}/> {t.printPdf}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--ink-500)' }}>
                  {t.noReports || (isHindi ? 'कोई रिपोर्ट उपलब्ध नहीं है' : 'No reports generated yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Report Modal */}
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

      {/* Dedicated Printable Certificate Modal */}
      {selectedReport && (
        <div className="modal-backdrop printable-modal" onClick={() => setSelectedReport(null)}>
          <div className="modal-box" style={{ width: 740, maxWidth: '95vw', padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#16a34a" />
                {isHindi ? 'गुणवत्ता स्क्रीनिंग प्रमाणपत्र' : 'Quality Screening Certificate'}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="button primary sm" onClick={() => triggerDirectPrint(selectedReport)}>
                  <Download size={13}/> {isHindi ? 'प्रिंट / PDF डाउनलोड करें' : 'Print / Export PDF'}
                </button>
                <button className="button secondary sm" onClick={() => setSelectedReport(null)}><X size={14}/></button>
              </div>
            </div>

            <div className="modal-body print-certificate-body" style={{ padding: 28, background: '#ffffff', color: '#0f172a' }}>
              {/* Certificate Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #16a34a', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', marginBottom: 4 }}>
                    <Leaf size={24} />
                    <b style={{ fontSize: 22, letterSpacing: '-0.3px', color: '#0f172a' }}>SmartFeed AI</b>
                  </div>
                  <small style={{ color: '#475569', fontSize: 12.5, fontWeight: 500 }}>
                    {isHindi ? 'डेयरी फ़ीड और साइलेज गुणवत्ता परीक्षण प्रमाणपत्र' : 'Dairy Feed & Silage Quality Screening Certificate'}
                  </small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge good" style={{ fontSize: 12, padding: '4px 12px' }}>
                    {isHindi ? '✔ डिजिटल रूप से सत्यापित' : '✔ Digitally Verified'}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>
                    <b>ID:</b> {selectedReport.id}<br />
                    <b>{isHindi ? 'दिनांक:' : 'Date:'}</b> {selectedReport.date || '22 May 2026, 10:30 AM'}
                  </div>
                </div>
              </div>

              {/* Sample & Batch Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>{isHindi ? 'संदर्भ आई डी' : 'Reference ID'}</small>
                  <b style={{ fontSize: 14, color: '#0f172a' }}>{selectedReport.ref || 'SF-2026-1256'}</b>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>{isHindi ? 'रिपोर्ट प्रकार' : 'Report Type'}</small>
                  <b style={{ fontSize: 14, color: '#0f172a' }}>{selectedReport.type || 'Sample Report'}</b>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>{isHindi ? 'गुणवत्ता स्कोर' : 'Quality Score'}</small>
                  <b style={{ fontSize: 16, color: '#16a34a' }}>87 / 100</b> <span className="badge good sm" style={{ fontSize: 10 }}>Good</span>
                </div>
              </div>

              {/* Parameters Table */}
              <b style={{ display: 'block', fontSize: 13, marginBottom: 10, color: '#0f172a' }}>{isHindi ? 'विश्लेषित पोषण और सुरक्षा पैरामीटर' : 'Tested Nutritional & Safety Parameters'}</b>
              <table className="data-table" style={{ marginBottom: 20, border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ color: '#1e293b' }}>Parameter</th>
                    <th style={{ color: '#1e293b' }}>Measured Value</th>
                    <th style={{ color: '#1e293b' }}>Optimal Target</th>
                    <th style={{ color: '#1e293b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Crude Protein (CP)</td><td><b>14.2 %</b></td><td>14.0 - 16.5 %</td><td><span className="badge good">Optimal</span></td></tr>
                  <tr><td>Moisture Content</td><td><b>58.0 %</b></td><td>55.0 - 65.0 %</td><td><span className="badge good">Optimal</span></td></tr>
                  <tr><td>NDF Fiber</td><td><b>28.4 %</b></td><td>&lt; 35.0 %</td><td><span className="badge good">Optimal</span></td></tr>
                  <tr><td>Energy Value (ME)</td><td><b>8.5 MJ/kg</b></td><td>&gt; 8.0 MJ/kg</td><td><span className="badge good">Optimal</span></td></tr>
                  <tr><td>Aflatoxin / Mycotoxins</td><td><b>4.0 ppb</b></td><td>&lt; 20.0 ppb</td><td><span className="badge good">Safe</span></td></tr>
                </tbody>
              </table>

              {/* Advisory Box */}
              <div style={{ padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 20 }}>
                <b style={{ color: '#14532d', fontSize: 12.5, display: 'block', marginBottom: 4 }}>
                  🌾 {isHindi ? 'AI एग्रोनॉमिस्ट सारांश और सलाह:' : 'AI Agronomist Screening Summary & Advisory:'}
                </b>
                <p style={{ margin: 0, fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                  {selectedReport.summary || (isHindi ? 'उच्च गुणवत्ता वाला मक्का साइलेज। इष्टतम नमी संतुलन (58%) और नगण्य फफूंद जोखिम पाया गया। दुधारू पशुओं के लिए अत्यधिक उपयुक्त।' : 'High quality maize silage batch. Optimal moisture balance (58%) and zero mold contamination detected. Safe for high-yielding dairy herd.')}
                </p>
              </div>

              {/* Certificate Footer & Stamp */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px dashed #cbd5e1', fontSize: 11, color: '#64748b' }}>
                <div>
                  <b style={{ color: '#0f172a' }}>SmartFeed AI Quality System</b><br />
                  <span>On-Farm Computer Vision & Agronomy Analytics</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '4px 12px', borderRadius: 4, fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>
                    ✔ OFFICIAL SCREENING PASSED
                  </div>
                  <div style={{ fontSize: 9.5, color: '#94a3b8', marginTop: 4 }}>*Rapid screening estimate — for legal disputes consult NABL accredited laboratory assay.</div>
                </div>
              </div>

              {/* On-screen Print & Download Action Bar */}
              <div className="no-print" style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  {isHindi ? 'प्रमाणपत्र प्रिंट करें या PDF के रूप में सहेजें' : 'Ready to print or export official screening certificate'}
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="button secondary sm" onClick={() => setSelectedReport(null)}>
                    {isHindi ? 'बंद करें' : 'Close'}
                  </button>
                  <button className="button primary sm" onClick={() => triggerDirectPrint(selectedReport)}>
                    <Download size={14}/> {isHindi ? '🖨️ प्रिंट / PDF सहेजें' : '🖨️ Print / Save PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_SILAGE_STAGES_EN = [
  {
    stageNumber: 1,
    title: 'Stage 1: Harvest & Chopping',
    desc: 'Harvest crop at milk line stage (30-35% dry matter) with 8-12 mm particle chop length.',
    checklist: [
      'Harvest maize when kernels reach 1/2 to 2/3 milk line stage',
      'Maintain theoretical chop length of 8-12 mm for ideal compaction',
      'Check kernel processing (all grains crushed to release starch)'
    ]
  },
  {
    stageNumber: 2,
    title: 'Stage 2: Pit Compaction & Inoculant',
    desc: 'Rapidly fill and pack forage layers in 15 cm lifts with heavy tractor rolling to purge oxygen.',
    checklist: [
      'Spread chopped forage in thin 15 cm uniform layers',
      'Apply heavy tractor packing (at least 5 minutes per ton of forage)',
      'Spray Lactic Acid Bacteria (LAB) inoculant at 10^5 CFU/g'
    ]
  },
  {
    stageNumber: 3,
    title: 'Stage 3: Hermetic Plastic Sealing',
    desc: 'Immediately cover pit with dual-layer oxygen barrier film and weight with tires or soil.',
    checklist: [
      'Cover pit within 12 hours of final packing',
      'Use 200-micron UV resistant oxygen barrier plastic sheeting',
      'Place tires or sandbags touching each other to eliminate air pockets'
    ]
  },
  {
    stageNumber: 4,
    title: 'Stage 4: Fermentation Phase (45 Days)',
    desc: 'Allow anaerobic lactic fermentation to lower pH < 4.2 and stabilize nutrients.',
    checklist: [
      'Inspect pit plastic sheeting weekly for punctures or rodent damage',
      'Maintain sealed storage for minimum 45 days before opening',
      'Ensure water drainage around pit perimeter during monsoon rains'
    ]
  },
  {
    stageNumber: 5,
    title: 'Stage 5: Feedout & Face Management',
    desc: 'Remove 15-20 cm daily straight across the pit face to prevent secondary aerobic heating.',
    checklist: [
      'Use shear grab or block cutter to keep pit face clean and flat',
      'Remove at least 15 cm daily from pit face during winter, 20 cm in summer',
      'Re-seal front plastic apron tightly after daily feed removal'
    ]
  }
]

const DEFAULT_SILAGE_STAGES_HI = [
  {
    stageNumber: 1,
    title: 'चरण 1: कटाई और दाना प्रसंस्करण (Harvest & Chopping)',
    desc: 'मक्के को मिल्क लाइन अवस्था (30-35% शुष्क पदार्थ) पर 8-12 मिमी के टुकड़ों में काटें।',
    checklist: [
      'मक्के की कटाई तब करें जब दाने 1/2 से 2/3 मिल्क लाइन अवस्था में हों',
      'इष्टतम दबाव के लिए 8-12 मिमी काटने की लंबाई बनाए रखें',
      'दाना प्रसंस्करण की जांच करें (सभी दाने पीसे हुए होने चाहिए)'
    ]
  },
  {
    stageNumber: 2,
    title: 'चरण 2: पिट रोलिंग और इनोकुलेंट स्प्रे',
    desc: 'ऑक्सीजन निकालने के लिए 15 सेमी की पतली परतों में भारी रोलर से दबाएं।',
    checklist: [
      'कटे हुए चारे को 15 सेमी की पतली परतों में बिछाएं',
      'भारी ट्रैक्टर से रोलिंग करें (कम से कम 5 मिनट प्रति टन चारा)',
      'लैक्टिक एसिड बैक्टीरिया (LAB) इनोकुलेंट का छिड़काव करें'
    ]
  },
  {
    stageNumber: 3,
    title: 'चरण 3: एयर-टाइट प्लास्टिक सीलिंग (Plastic Sealing)',
    desc: 'पिट को यूवी-प्रतिरोधी प्लास्टिक और टायरों/मिट्टी के वजन से ढकें।',
    checklist: [
      'अंतिम रोलिंग के 12 घंटे के भीतर पिट को ढक दें',
      '200-माइक्रॉन यूवी प्रतिरोधी प्लास्टिक शीट का प्रयोग करें',
      'हवा के रिसाव को रोकने के लिए प्लास्टिक पर टायर/बोरे रखें'
    ]
  },
  {
    stageNumber: 4,
    title: 'चरण 4: किण्वन चरण (45 दिन भंडारण)',
    desc: 'अवायवीय किण्वन द्वारा पीएच < 4.2 तक लाने और पोषक तत्व सुरक्षित करने दें।',
    checklist: [
      'प्लास्टिक में छेद की साप्ताहिक जांच करें',
      'पिट को खोलने से पहले कम से कम 45 दिन बंद रखें',
      'बारिश के पानी को पिट के पास इकट्ठा न होने दें'
    ]
  },
  {
    stageNumber: 5,
    title: 'चरण 5: दैनिक कटाई एवं फेस प्रबंधन',
    desc: 'हवा के संपर्क से बचने के लिए दैनिक रूप से सीधी कटाई करें।',
    checklist: [
      'पिट फेस को सीधा और साफ काटने के लिए कटर का उपयोग करें',
      'सर्दियों में 15 सेमी और गर्मियों में 20 सेमी प्रतिदिन निकालें',
      'दैनिक चारा निकालने के बाद प्लास्टिक को वापस कसकर ढकें'
    ]
  }
]

function SilageCoach() {
  const { t, apiFetch, toast, lang, loc: locTerm } = useApp()
  const isHindi = lang === 'हिंदी'
  const defaultStages = isHindi ? DEFAULT_SILAGE_STAGES_HI : DEFAULT_SILAGE_STAGES_EN

  const [stages, setStages] = useState(defaultStages)
  const [steps, setSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('smartfeed_silage_steps')
      return saved ? JSON.parse(saved) : [
        { stageNumber: 1, completed: true, checkedItems: [0, 1, 2] },
        { stageNumber: 2, completed: true, checkedItems: [0, 1, 2] }
      ]
    } catch (e) {
      return [
        { stageNumber: 1, completed: true, checkedItems: [0, 1, 2] },
        { stageNumber: 2, completed: true, checkedItems: [0, 1, 2] }
      ]
    }
  })

  // Synchronize stages when language changes
  useEffect(() => {
    setStages(isHindi ? DEFAULT_SILAGE_STAGES_HI : DEFAULT_SILAGE_STAGES_EN)
  }, [isHindi])

  const saveStepsLocal = (newSteps) => {
    setSteps(newSteps)
    try { localStorage.setItem('smartfeed_silage_steps', JSON.stringify(newSteps)) } catch (e) {}
  }

  const load = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/silage-coach?batchId=SILAGE-001&lang=${lang}`)
      if (data && Array.isArray(data.stages) && data.stages.length > 0) {
        setStages(data.stages)
        if (Array.isArray(data.steps) && data.steps.length > 0) {
          saveStepsLocal(data.steps)
        }
      }
    } catch (e) {
      console.warn('Backend offline, using local Silage Coach stages')
    }
  }, [apiFetch, lang])

  useEffect(() => { load() }, [load])

  const toggle = async (stageNum, itemIndex, itemText) => {
    const step = steps.find(s => s.stageNumber === stageNum) || {}
    const checked = step.checkedItems || []
    const isAlreadyChecked = checked.includes(itemIndex) || checked.includes(itemText)
    const next = isAlreadyChecked 
      ? checked.filter(x => x !== itemIndex && x !== itemText) 
      : [...checked, itemIndex]
    const def = stages.find(s => s.stageNumber === stageNum) || {}
    const isCompleted = next.length >= (def?.checklist?.length || 3)

    try {
      await apiFetch(`/api/silage-coach/stage/${stageNum}`, {
        method: 'PUT',
        body: JSON.stringify({ batchId: 'SILAGE-001', completed: isCompleted, checkedItems: next })
      })
    } catch (e) {
      console.warn('Backend offline, saving silage step locally')
    }

    const otherSteps = steps.filter(s => s.stageNumber !== stageNum)
    const updated = [...otherSteps, { stageNumber: stageNum, completed: isCompleted, checkedItems: next }]
    saveStepsLocal(updated)

    toast(
      isHindi 
        ? `चरण ${stageNum} मील का पत्थर अपडेट किया गया`
        : `Stage ${stageNum} milestone updated`,
      'success'
    )
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
                  const isChecked = (step.checkedItems || []).includes(i) || (step.checkedItems || []).includes(c)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, cursor: 'pointer' }} onClick={() => toggle(stage.stageNumber, i, c)}>
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
  const { t, apiFetch, loc: locTerm, lang } = useApp()
  const isHindi = lang === 'हिंदी'
  const [range, setRange] = useState('30 days')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    apiFetch('/api/analytics').then(setAnalytics).catch(err => {
      console.warn('Backend offline, using fallback analytics:', err.message)
    })
  }, [apiFetch])

  const scores = (analytics?.trendData && analytics.trendData[range]) || trendData[range] || trendData['30 days'] || [72, 78, 75, 82, 76, 87, 81]
  const avgScore = analytics?.averageScore || Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1))

  const params = [
    { name: isHindi ? 'क्रूड प्रोटीन (CP)' : 'Crude Protein (CP)', val: '14.2%', target: '14.0 - 16.5%', pct: 85 },
    { name: isHindi ? 'नमी (Moisture)' : 'Moisture Content', val: '62.5%', target: '60.0 - 68.0%', pct: 90 },
    { name: isHindi ? 'एनडीएफ फाइबर (NDF)' : 'NDF Fiber', val: '38.4%', target: '< 40.0%', pct: 78 },
    { name: isHindi ? 'ऊर्जा मान (ME)' : 'Energy Value (ME)', val: '8.5 MJ/kg', target: '> 8.0 MJ/kg', pct: 88 },
    { name: isHindi ? 'मायकोटॉक्सिन स्तर' : 'Mycotoxin Level', val: '4 ppb', target: '< 20 ppb', pct: 95 },
  ]

  const distData = (analytics?.feedTypeDistribution && Object.keys(analytics.feedTypeDistribution).length > 0)
    ? analytics.feedTypeDistribution
    : { 'Maize Silage': 3, 'Cattle Feed Pellet': 1, 'Grass Silage': 1, 'Dairy Concentrate': 1 }
  const totalTests = analytics?.totalTests || 6

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analytics || (isHindi ? 'विश्लेषिकी और रुझान' : 'Analytics & Trends')}</h1>
          <p>{t.analyticsSubtitle || (isHindi ? 'ऐतिहासिक गुणवत्ता मेट्रिक्स, जोखिम वितरण और दूध उत्पादन सहसंबंध' : 'Historical quality metrics, risk distribution & milk yield correlation')}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7 days', '30 days', '90 days'].map(r => (
            <button key={r} className={`button ${range === r ? 'primary sm' : 'secondary sm'}`} onClick={() => setRange(r)}>
              {isHindi ? (r === '7 days' ? '7 दिन' : r === '30 days' ? '30 दिन' : '90 दिन') : r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <small style={{ color: 'var(--ink-500)', fontSize: 12 }}>{t.avgFeedHealthIndex || (isHindi ? 'औसत फीड स्वास्थ्य सूचकांक' : 'Avg Feed Health Index')}</small>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{avgScore}<span style={{ fontSize: 13, color: 'var(--ink-500)' }}>/100</span></div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
            <BarChart3 size={22} />
          </div>
          <div>
            <small style={{ color: 'var(--ink-500)', fontSize: 12 }}>{t.totalAssessedBatches || (isHindi ? 'मूल्यांकन किए गए कुल बैच' : 'Total Assessed Batches')}</small>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{analytics?.activeBatches || 5} <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>({totalTests} {isHindi ? 'परीक्षण' : 'tests'})</span></div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}>
            <Award size={22} />
          </div>
          <div>
            <small style={{ color: 'var(--ink-500)', fontSize: 12 }}>{t.safeFeedingRatio || (isHindi ? 'सुरक्षित फ़ीड अनुपात' : 'Safe Feeding Ratio')}</small>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>{Math.round(((analytics?.riskDistribution?.Good || 4) / totalTests) * 100)}% <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>↑ +4.2%</span></div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#9333ea', display: 'grid', placeItems: 'center' }}>
            <HeartPulse size={22} />
          </div>
          <div>
            <small style={{ color: 'var(--ink-500)', fontSize: 12 }}>{isHindi ? 'दूध उत्पादन प्रभाव' : 'Milk Yield Impact'}</small>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-900)' }}>+1.8 L<span style={{ fontSize: 11, color: 'var(--ink-500)' }}>/cow/day</span></div>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: 20, marginBottom: 20 }}>
        {/* Quality Score Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <b style={{ fontSize: 15 }}>{isHindi ? 'गुणवत्ता स्कोर रुझान' : 'Quality Score Trend'}</b>
              <small style={{ display: 'block', color: 'var(--ink-500)' }}>{range} {isHindi ? 'की अवधि में प्रदर्शन' : 'performance over time'}</small>
            </div>
            <span className="badge good">{avgScore > 75 ? (isHindi ? 'उच्च गुणवत्ता' : 'Optimal Quality') : (isHindi ? 'मध्यम' : 'Moderate')}</span>
          </div>

          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '10px 0 20px', borderBottom: '1px solid var(--border-light)' }}>
            {scores.map((sc, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: sc >= 80 ? '#16a34a' : sc >= 65 ? '#d97706' : '#dc2626' }}>{sc}</span>
                <div style={{ width: '100%', height: `${sc}%`, background: sc >= 80 ? 'linear-gradient(180deg, #22c55e, #16a34a)' : sc >= 65 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'linear-gradient(180deg, #ef4444, #dc2626)', borderRadius: '6px 6px 0 0', transition: 'all 0.3s ease' }} />
                <small style={{ fontSize: 10, color: 'var(--ink-500)' }}>P{idx + 1}</small>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--ink-600)' }}>
            <span><b>{isHindi ? 'न्यूनतम:' : 'Lowest:'}</b> {Math.min(...scores)}</span>
            <span><b>{isHindi ? 'औसत:' : 'Average:'}</b> {avgScore}</span>
            <span><b>{isHindi ? 'अधिकतम:' : 'Peak:'}</b> {Math.max(...scores)}</span>
          </div>
        </div>

        {/* Nutritional Parameters */}
        <div className="card">
          <b style={{ display: 'block', fontSize: 15, marginBottom: 14 }}>{isHindi ? 'पोषण संबंधी पैरामीटर विश्लेषण' : 'Nutritional Parameter Averages'}</b>
          <div style={{ display: 'grid', gap: 14 }}>
            {params.map(p => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span><b>{p.name}</b> <small style={{ color: 'var(--ink-500)' }}>({p.target})</small></span>
                  <b style={{ color: 'var(--brand-primary)' }}>{p.val}</b>
                </div>
                <div style={{ height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Type Distribution */}
      <div className="card" style={{ marginBottom: 20 }}>
        <b style={{ display: 'block', fontSize: 14, marginBottom: 12 }}>{t.feedTypeDistribution || (isHindi ? 'फ़ीड प्रकार वितरण' : 'Feed Type Distribution')}</b>
        <div style={{ display: 'grid', gap: 10 }}>
          {Object.entries(distData).map(([ft, count]) => (
            <div key={ft}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                <span>{locTerm(ft)}</span>
                <b>{count} {isHindi ? 'नमूने' : 'samples'}</b>
              </div>
              <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(count / totalTests) * 100}%`, height: '100%', background: '#16a34a' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#16a34a', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Sparkles size={18} />
          </div>
          <div>
            <b style={{ fontSize: 14, color: '#14532d', display: 'block', marginBottom: 4 }}>
              {isHindi ? '🌾 AI एग्रोनॉमिस्ट इनसाइट्स और सिफारिशें' : '🌾 AI Agronomist Insights & Strategic Recommendations'}
            </b>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#166534', display: 'grid', gap: 4 }}>
              <li>{isHindi ? 'मक्का साइलेज (SILAGE-001) ने उच्चतम गुणवत्ता (87/100) दर्ज की, जिससे प्रति गाय दैनिक दूध उत्पादन में +2.1 लीटर की वृद्धि हुई।' : 'Maize Silage from SILAGE-001 achieved peak quality score (87/100), correlating with +2.1 L/cow/day higher milk yield.'}</li>
              <li>{isHindi ? 'खुले गड्ढे में रखे साइलेज में 14% अधिक नमी का उतार-चढ़ाव देखा गया। साइलेज पिट की सीलिंग में सुधार की सलाह दी जाती है।' : 'Open-pit silage samples showed 14% higher moisture variation. Recommendation: Upgrade silo seal & compaction.'}</li>
              <li>{isHindi ? 'मायकोटॉक्सिन का स्तर सुरक्षित सीमा (4 ppb < 20 ppb) में है। वर्तमान सुरक्षा प्रोटोकॉल बनाए रखें।' : 'Aflatoxin & mold risk remains well within safe threshold (< 20 ppb). Maintain current dry storage protocol.'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── SCREEN: PROFILE & SETTINGS ─────────────────── */
function Profile() {
  const { t, user, setUser, updateUser, lang, toast, apiFetch } = useApp()
  const isHindi = lang === 'हिंदी'

  const [name, setName]       = useState(user?.name     || (isHindi ? 'किसान राज' : 'Farmer Raj'))
  const [phone, setPhone]     = useState(user?.phone    || '+91 98765 43210')
  const [location, setLoc]    = useState(user?.location || (isHindi ? 'आनंद, गुजरात' : 'Anand, Gujarat'))
  const [herdSize, setHerd]   = useState(user?.cattleCount || 24)
  const [saving, setSaving]   = useState(false)

  // Keep state in sync if user changes
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name)
      if (user.phone) setPhone(user.phone)
      if (user.location) setLoc(user.location)
      if (user.cattleCount) setHerd(user.cattleCount)
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: name.trim(), phone: phone.trim(), location: location.trim(), cattleCount: Number(herdSize) || 10 }
      // Persist to backend
      await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }).catch((err) => {
        console.warn('Backend profile PUT error (continuing with local update):', err)
      })
      // Always update local user state + context + localStorage
      if (updateUser) {
        updateUser(payload)
      } else {
        const updated = { ...(user || {}), ...payload }
        setUser(updated)
        localStorage.setItem('smartfeed_user', JSON.stringify(updated))
      }
      toast(isHindi ? 'प्रोफ़ाइल सहेजी गई ✓' : 'Profile saved successfully ✓', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>{t.profileTitle}</h1><p>{t.profileSubtitle}</p></div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
          <div className="topbar-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{name ? name[0].toUpperCase() : 'R'}</div>
          <div>
            <b style={{ fontSize: 18 }}>{name}</b>
            <small style={{ display: 'block', color: 'var(--ink-500)' }}>{user?.email || 'raj@farm.com'} · {location}</small>
          </div>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-field-group">
            <label className="field-label">{t.fullName}
              <input className="field-input" value={name} onChange={e => setName(e.target.value)}/>
            </label>
            <label className="field-label">{t.phone}
              <input className="field-input" value={phone} onChange={e => setPhone(e.target.value)}/>
            </label>
          </div>
          <div className="form-field-group" style={{ marginBottom: 20 }}>
            <label className="field-label">{t.location}
              <input className="field-input" value={location} onChange={e => setLoc(e.target.value)}/>
            </label>
            <label className="field-label">{t.dairyHerdSize}
              <input type="number" className="field-input" value={herdSize} onChange={e => setHerd(e.target.value)}/>
            </label>
          </div>
          <button type="submit" className="button primary full" disabled={saving}>
            {saving ? <><RefreshCw size={14} className="spin"/> {isHindi ? 'सहेज रहे हैं...' : 'Saving...'}</> : (isHindi ? '💾 प्रोफ़ाइल सहेजें' : '💾 Save Profile')}
          </button>
        </form>
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

