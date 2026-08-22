import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, BarChart3, Bot, ChevronRight, ClipboardCheck, Download, FileText, Filter,
  HelpCircle, Home, Languages, Leaf, LogOut, Menu, Package, Plus, ScanSearch,
  Settings, ShieldCheck, Star, TrendingUp, Upload, UserCircle, X, Zap, AlertTriangle,
  CheckCircle, Bell, Search, Calendar, Eye, RefreshCw, Send, Trash2, CheckCheck
} from 'lucide-react'
import { mockBatches, mockReports, mockTests, resultParameters, trendData } from './mockData'

const navItems = [
  ['/dashboard', 'Dashboard', BarChart3],
  ['/analysis/new', 'New Analysis', ScanSearch],
  ['/batches', 'My Batches', Package],
  ['/history', 'History', Activity],
  ['/analytics', 'Analytics', TrendingUp],
  ['/reports', 'Reports', FileText],
  ['/assistant', 'AI Assistant', Bot],
  ['/profile', 'Profile', UserCircle],
  ['/settings', 'Settings', Settings],
]

const riskClass = risk => risk === 'Good' ? 'good' : risk === 'Caution' ? 'caution' : 'high'
const riskIcon = risk => risk === 'Good' ? <CheckCircle size={12}/> : risk === 'Caution' ? <AlertTriangle size={12}/> : <AlertTriangle size={12}/>

/* ── Global App Context (language, settings, toast) ── */
const AppCtx = createContext({})
function useApp() { return useContext(AppCtx) }

const LANGS = {
  English: {
    /* Nav */
    dashboard:'Dashboard', newAnalysis:'New Analysis', myBatches:'My Batches',
    history:'History', analytics:'Analytics', reports:'Reports',
    aiAssistant:'AI Assistant', profile:'Profile', settings:'Settings',
    workspace:'Workspace', account:'Account', language:'Language',
    needHelp:'Need Help?', contactSupport:'Contact Support', offlineReady:'Offline-ready',
    /* Dashboard */
    welcomeBack:'Welcome back, Farmer Raj 👋',
    monitorDesc:'Monitor quality, identify risks, and keep your herd healthy.',
    totalAnalyses:'Total Analyses', goodQuality:'Good Quality', caution:'Caution', highRisk:'High Risk',
    fromLastWeek:'↑ 12% from last week', ofTotal:'of total',
    averageScore:'Average Score', points:'points',
    qualityTrend:'Quality Trend (All Batches)', avgScoreOverTime:'Average score over time',
    riskDistribution:'Risk Distribution', currentTiers:'Current screening tiers',
    recentAnalyses:'Recent Analyses', viewAll:'View all →',
    sampleId:'Sample ID', batchId:'Batch ID', type:'Type', analyzedOn:'Analyzed On',
    score:'Score', risk:'Risk', action:'Action', view:'View',
    /* New Analysis */
    newAnalysisTitle:'New Analysis', newAnalysisDesc:'Upload a photo of your feed or silage to get an instant AI quality score.',
    uploadImage:'Upload Sample Image', dragDrop:'Drag & drop or click to browse',
    supportedFormats:'JPG, PNG up to 10MB', analyzing:'Analyzing sample...',
    sampleInfo:'Sample Information', sampleType:'Sample Type', feedType:'Feed Type',
    storageDuration:'Storage Duration (Days)', storageCondition:'Storage Condition',
    notes:'Notes (Optional)', notesPlaceholder:'Any additional information...',
    analyzeBtn:'Analyze Sample', processing:'Processing...', disclaimer:'Results are screening estimates, not laboratory measurements.',
    maizeSilage:'Maize Silage', grassSilage:'Grass Silage', cattleFeed:'Cattle Feed', dairyConcentrate:'Dairy Concentrate',
    silage:'Silage', feed:'Feed', covered:'Covered', open:'Open', silo:'Silo',
    /* Result */
    analysisResult:'Analysis Result', downloadReport:'Download Report',
    sampleTypeLabel:'Sample Type', modelConfidence:'Model Confidence',
    uploadedImage:'Uploaded Image', aiHeatmap:'AI Explanation (Heatmap)',
    highImpact:'High Impact', medium:'Medium', lowImpact:'Low Impact',
    qualityScoreRange:'Quality Score Range', good:'Good', screeningRisk:'Screening Risk',
    lowRisk:'Low Risk', keyIndicators:'Key Indicators',
    ind1:'Normal color and texture detected', ind2:'No significant mold detected',
    ind3:'Good storage parameters', ind4:'No visible spoilage signs',
    screeningEst:'Screening estimate — not a laboratory measurement.',
    /* Batches */
    myBatchesTitle:'My Batches', myBatchesDesc:'Manage and track your feed and silage batches.',
    addNewBatch:'Add New Batch', batchIdName:'Batch ID / Name', createBatch:'Create Batch',
    batchStatus:'Status', active:'Active',
    /* Batch Detail */
    batchDetail:'Batch Detail', batchInfo:'Batch Information',
    qualityTrendBatch:'Quality Trend', createdOn:'Created On',
    storage:'Storage', totalAnalysesCount:'Total Analyses',
    /* History */
    historyTitle:'History', historyDesc:'View all past analyses.',
    showing:'Showing', of:'of', records:'records',
    exportCsv:'Export CSV', searchPlaceholder:'Search by Sample or Batch ID...',
    allTypes:'All Types', allRisks:'All Risks',
    /* Analytics */
    analyticsTitle:'Analytics', analyticsDesc:'Trends and insights across all batches.',
    scoreDist:'Score Distribution by Batch',
    /* Reports */
    reportsTitle:'Reports', reportsDesc:'Generate and download screening reports.',
    generateReport:'Generate New Report', reportType:'Report Type',
    generatedOn:'Generated On', sampleBatch:'Sample / Batch',
    sampleReports:'Sample Reports', batchReports:'Batch Reports',
    reference:'Reference', generate:'Generate Report', noReports:'No reports yet',
    /* Assistant */
    assistantTitle:'AI Assistant', assistantDesc:'Ask anything about feed and silage quality.',
    clearChat:'Clear Chat', typeQuestion:'Type your question...', send:'Send',
    q1:'What does a score of 62 mean?', q2:'How to detect mold?', q3:'Ideal moisture level?',
    botGreet:'Hello! 👋 Ask me anything about feed and silage quality. I can help you interpret results, storage tips, and more.',
    /* Profile */
    profileTitle:'Farmer Profile', profileDesc:'Manage your account details.',
    editProfile:'Edit Profile', saveChanges:'Save Changes', cancel:'Cancel',
    fullName:'Full Name', email:'Email', phone:'Phone', farmName:'Farm Name', location:'Location',
    recentActivity:'Recent Activity', profileUpdated:'Profile updated successfully!',
    /* Settings */
    settingsTitle:'Settings', settingsDesc:'Configure your SmartFeed AI preferences.',
    saveSettings:'Save Settings', saved:'Saved!',
    preferences:'Preferences', langRegion:'Language & Region',
    dataPrivacy:'Data & Privacy',
    pushNotif:'Push Notifications', pushNotifDesc:'Get alerted when a high-risk sample is detected',
    offlineMode:'Offline Mode', offlineModeDesc:'Cache data locally so the app works without internet',
    darkMode:'Dark Mode', darkModeDesc:'Switch the interface to a dark colour scheme',
    interfaceLang:'Interface Language', interfaceLangDesc:'Changes the language of all labels and navigation',
    clearCache:'Clear Local Cache', clearCacheDesc:'Remove all locally stored analyses and batch data',
    clearCacheBtn:'Clear Cache', exportAll:'Export All Data', exportAllDesc:'Download a full CSV export of all your analyses',
    export:'Export', on:'On', off:'Off', settingsSaved:'Settings saved successfully!',
    /* Notifications */
    notifications:'Notifications', markAllRead:'Mark all read', viewAllNotif:'View all notifications →',
    notif1Title:'High Risk Detected', notif1Desc:'Sample SF-2026-1253 scored 44 — High Risk',
    notif2Title:'Analysis Complete', notif2Desc:'SF-2026-1256 analyzed successfully. Score: 87',
    notif3Title:'Batch Report Ready', notif3Desc:'Batch report for SILAGE-001 is ready to download',
    notif4Title:'New Batch Created', notif4Desc:'SILAGE-003 batch was created and is active',
    /* Toasts */
    toastLangChanged:'Language changed to English', toastCacheCleared:'Local cache cleared', toastExportStarted:'Export started — file will download shortly',
    toastDarkOn:'Dark mode enabled', toastDarkOff:'Dark mode disabled',
    toastNotifOn:'Notifications turned on', toastNotifOff:'Notifications turned off',
    toastOfflineOn:'Offline mode enabled', toastOfflineOff:'Offline mode disabled',
    /* Extra */
    scoreDistBatch:'Score Distribution by Batch', backToBatches:'Back to Batches',
    viewReport:'View Report', analyses:'Analyses', batches:'Batches',
    status:'Status', total:'Total', downloading:'Mock PDF downloaded',
    or:'or', browseFiles:'Browse Files', uploadHint:'Supports JPG, PNG · Max 10MB',
  },
  हिंदी: {
    /* Nav */
    dashboard:'डैशबोर्ड', newAnalysis:'नया विश्लेषण', myBatches:'मेरे बैच',
    history:'इतिहास', analytics:'विश्लेषिकी', reports:'रिपोर्ट',
    aiAssistant:'AI सहायक', profile:'प्रोफ़ाइल', settings:'सेटिंग्स',
    workspace:'कार्यक्षेत्र', account:'खाता', language:'भाषा',
    needHelp:'सहायता चाहिए?', contactSupport:'सहायता से संपर्क करें', offlineReady:'ऑफ़लाइन-तैयार',
    /* Dashboard */
    welcomeBack:'स्वागत है, किसान राज 👋',
    monitorDesc:'गुणवत्ता की निगरानी करें, जोखिम पहचानें और अपने पशुओं को स्वस्थ रखें।',
    totalAnalyses:'कुल विश्लेषण', goodQuality:'अच्छी गुणवत्ता', caution:'सावधानी', highRisk:'उच्च जोखिम',
    fromLastWeek:'↑ पिछले सप्ताह से 12%', ofTotal:'कुल का',
    averageScore:'औसत स्कोर', points:'अंक',
    qualityTrend:'गुणवत्ता प्रवृत्ति (सभी बैच)', avgScoreOverTime:'समय के साथ औसत स्कोर',
    riskDistribution:'जोखिम वितरण', currentTiers:'वर्तमान स्क्रीनिंग स्तर',
    recentAnalyses:'हाल के विश्लेषण', viewAll:'सभी देखें →',
    sampleId:'नमूना ID', batchId:'बैच ID', type:'प्रकार', analyzedOn:'विश्लेषण दिनांक',
    score:'स्कोर', risk:'जोखिम', action:'कार्रवाई', view:'देखें',
    /* New Analysis */
    newAnalysisTitle:'नया विश्लेषण', newAnalysisDesc:'अपने चारे या साइलेज की फ़ोटो अपलोड करें और तुरंत AI गुणवत्ता स्कोर पाएं।',
    uploadImage:'नमूने की फ़ोटो अपलोड करें', dragDrop:'यहाँ खींचें और छोड़ें या क्लिक करें',
    supportedFormats:'JPG, PNG — अधिकतम 10MB', analyzing:'नमूने का विश्लेषण हो रहा है...',
    sampleInfo:'नमूना जानकारी', sampleType:'नमूना प्रकार', feedType:'चारा प्रकार',
    storageDuration:'भंडारण अवधि (दिन)', storageCondition:'भंडारण स्थिति',
    notes:'टिप्पणी (वैकल्पिक)', notesPlaceholder:'कोई अतिरिक्त जानकारी...',
    analyzeBtn:'नमूना विश्लेषण करें', processing:'प्रक्रिया हो रही है...', disclaimer:'परिणाम स्क्रीनिंग अनुमान हैं, प्रयोगशाला माप नहीं।',
    maizeSilage:'मक्का साइलेज', grassSilage:'घास साइलेज', cattleFeed:'पशु चारा', dairyConcentrate:'डेयरी सांद्र',
    silage:'साइलेज', feed:'चारा', covered:'ढका हुआ', open:'खुला', silo:'साइलो',
    /* Result */
    analysisResult:'विश्लेषण परिणाम', downloadReport:'रिपोर्ट डाउनलोड करें',
    sampleTypeLabel:'नमूना प्रकार', modelConfidence:'मॉडल विश्वसनीयता',
    uploadedImage:'अपलोड की गई फ़ोटो', aiHeatmap:'AI व्याख्या (हीटमैप)',
    highImpact:'उच्च प्रभाव', medium:'मध्यम', lowImpact:'कम प्रभाव',
    qualityScoreRange:'गुणवत्ता स्कोर सीमा', good:'अच्छा', screeningRisk:'स्क्रीनिंग जोखिम',
    lowRisk:'कम जोखिम', keyIndicators:'मुख्य संकेतक',
    ind1:'सामान्य रंग और बनावट पाई गई', ind2:'कोई महत्वपूर्ण फफूंद नहीं मिली',
    ind3:'भंडारण मापदंड ठीक हैं', ind4:'खराबी के कोई दृश्य संकेत नहीं',
    screeningEst:'स्क्रीनिंग अनुमान — प्रयोगशाला माप नहीं।',
    /* Batches */
    myBatchesTitle:'मेरे बैच', myBatchesDesc:'अपने चारे और साइलेज बैच प्रबंधित करें।',
    addNewBatch:'नया बैच जोड़ें', batchIdName:'बैच ID / नाम', createBatch:'बैच बनाएं',
    batchStatus:'स्थिति', active:'सक्रिय',
    /* Batch Detail */
    batchDetail:'बैच विवरण', batchInfo:'बैच जानकारी',
    qualityTrendBatch:'गुणवत्ता प्रवृत्ति', createdOn:'बनाया गया',
    storage:'भंडारण', totalAnalysesCount:'कुल विश्लेषण',
    /* History */
    historyTitle:'इतिहास', historyDesc:'सभी पिछले विश्लेषण देखें।',
    showing:'दिखाए जा रहे', of:'में से', records:'रिकॉर्ड',
    exportCsv:'CSV निर्यात करें', searchPlaceholder:'नमूना या बैच ID खोजें...',
    allTypes:'सभी प्रकार', allRisks:'सभी जोखिम',
    /* Analytics */
    analyticsTitle:'विश्लेषिकी', analyticsDesc:'सभी बैच में रुझान और अंतर्दृष्टि।',
    scoreDist:'बैच के अनुसार स्कोर वितरण',
    /* Reports */
    reportsTitle:'रिपोर्ट', reportsDesc:'स्क्रीनिंग रिपोर्ट बनाएं और डाउनलोड करें।',
    generateReport:'नई रिपोर्ट बनाएं', reportType:'रिपोर्ट प्रकार',
    generatedOn:'बनाई गई', sampleBatch:'नमूना / बैच',
    sampleReports:'नमूना रिपोर्ट', batchReports:'बैच रिपोर्ट',
    reference:'संदर्भ', generate:'रिपोर्ट बनाएं', noReports:'अभी कोई रिपोर्ट नहीं',
    /* Assistant */
    assistantTitle:'AI सहायक', assistantDesc:'चारे और साइलेज की गुणवत्ता के बारे में कुछ भी पूछें।',
    clearChat:'चैट साफ़ करें', typeQuestion:'अपना प्रश्न लिखें...', send:'भेजें',
    q1:'62 स्कोर का क्या मतलब है?', q2:'फफूंद कैसे पहचानें?', q3:'आदर्श नमी स्तर क्या है?',
    botGreet:'नमस्ते! 👋 चारे और साइलेज गुणवत्ता के बारे में कुछ भी पूछें। मैं परिणाम, भंडारण सुझाव और अधिक में मदद कर सकता हूँ।',
    /* Profile */
    profileTitle:'किसान प्रोफ़ाइल', profileDesc:'अपने खाते की जानकारी प्रबंधित करें।',
    editProfile:'प्रोफ़ाइल संपादित करें', saveChanges:'बदलाव सहेजें', cancel:'रद्द करें',
    fullName:'पूरा नाम', email:'ईमेल', phone:'फ़ोन', farmName:'फ़ार्म का नाम', location:'स्थान',
    recentActivity:'हाल की गतिविधि', profileUpdated:'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!',
    /* Settings */
    settingsTitle:'सेटिंग्स', settingsDesc:'अपनी SmartFeed AI प्राथमिकताएं कॉन्फ़िगर करें।',
    saveSettings:'सेटिंग्स सहेजें', saved:'सहेज लिया!',
    preferences:'प्राथमिकताएं', langRegion:'भाषा और क्षेत्र',
    dataPrivacy:'डेटा और गोपनीयता',
    pushNotif:'पुश सूचनाएं', pushNotifDesc:'उच्च जोखिम नमूने पर अलर्ट पाएं',
    offlineMode:'ऑफ़लाइन मोड', offlineModeDesc:'इंटरनेट के बिना ऐप चलाने के लिए डेटा स्थानीय रूप से कैश करें',
    darkMode:'डार्क मोड', darkModeDesc:'इंटरफ़ेस को डार्क रंग योजना में बदलें',
    interfaceLang:'इंटरफ़ेस भाषा', interfaceLangDesc:'सभी लेबल और नेविगेशन की भाषा बदलें',
    clearCache:'स्थानीय कैश साफ़ करें', clearCacheDesc:'सभी स्थानीय रूप से संग्रहीत विश्लेषण और बैच डेटा हटाएं',
    clearCacheBtn:'कैश साफ़ करें', exportAll:'सभी डेटा निर्यात करें', exportAllDesc:'सभी विश्लेषणों की पूर्ण CSV डाउनलोड करें',
    export:'निर्यात करें', on:'चालू', off:'बंद', settingsSaved:'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    /* Notifications */
    notifications:'सूचनाएं', markAllRead:'सभी पढ़ें', viewAllNotif:'सभी सूचनाएं देखें →',
    notif1Title:'उच्च जोखिम मिला', notif1Desc:'नमूना SF-2026-1253 का स्कोर 44 — उच्च जोखिम',
    notif2Title:'विश्लेषण पूर्ण', notif2Desc:'SF-2026-1256 का विश्लेषण सफल। स्कोर: 87',
    notif3Title:'बैच रिपोर्ट तैयार', notif3Desc:'SILAGE-001 की बैच रिपोर्ट डाउनलोड के लिए तैयार है',
    notif4Title:'नया बैच बनाया गया', notif4Desc:'SILAGE-003 बैच बनाया गया और सक्रिय है',
    /* Toasts */
    toastLangChanged:'भाषा हिंदी में बदली गई', toastCacheCleared:'स्थानीय कैश साफ़ हुआ', toastExportStarted:'निर्यात शुरू — फ़ाइल जल्द डाउनलोड होगी',
    toastDarkOn:'डार्क मोड चालू', toastDarkOff:'डार्क मोड बंद',
    toastNotifOn:'सूचनाएं चालू', toastNotifOff:'सूचनाएं बंद',
    toastOfflineOn:'ऑफ़लाइन मोड चालू', toastOfflineOff:'ऑफ़लाइन मोड बंद',
    /* Extra */
    scoreDistBatch:'बैच के अनुसार स्कोर वितरण', backToBatches:'बैच सूची पर वापस',
    viewReport:'रिपोर्ट देखें', analyses:'विश्लेषण', batches:'बैच',
    status:'स्थिति', total:'कुल', downloading:'PDF डाउनलोड (प्रदर्शन मात्र)',
    or:'या', browseFiles:'फ़ाइल चुनें', uploadHint:'JPG, PNG समर्थित · अधिकतम 10MB',
  }
}

/* ── Toast Notification ── */
function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
          {t.type === 'success' ? <CheckCheck size={14}/> : t.type === 'error' ? <AlertTriangle size={14}/> : <Bell size={14}/>}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [lang, setLang] = useState('English')
  const [settings, setSettings] = useState({ notifications: true, offline: true, darkMode: false })
  const [toasts, setToasts] = useState([])
  const t = LANGS[lang] || LANGS.English

  const toast = (msg, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), duration)
  }

  const setSetting = (key, val) => {
    setSettings(s => ({ ...s, [key]: val }))
    const tr = LANGS[lang] || LANGS.English
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark', val)
      toast(val ? tr.toastDarkOn : tr.toastDarkOff, 'success')
    } else if (key === 'notifications') {
      toast(val ? tr.toastNotifOn : tr.toastNotifOff, val ? 'success' : 'info')
    } else if (key === 'offline') {
      toast(val ? tr.toastOfflineOn : tr.toastOfflineOff, 'info')
    }
  }

  const switchLang = (l) => {
    setLang(l)
    const tr = LANGS[l] || LANGS.English
    toast(tr.toastLangChanged, 'success')
  }

  return (
    <AppCtx.Provider value={{ lang, t, settings, setSetting, switchLang, toast }}>
      <div className={settings.darkMode ? 'dark-root' : ''}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/*" element={<Shell />} />
          </Routes>
        </BrowserRouter>
        <Toast toasts={toasts}/>
      </div>
    </AppCtx.Provider>
  )
}

/* ─────────────────── LANDING PAGE ─────────────────── */
function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="landing">
      {/* Navbar */}
      <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-mark"><Leaf size={18}/></span>
          <b>SmartFeed AI</b>
        </Link>
        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#stats">Results</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="landing-nav-actions">
          <button className="button secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="button primary" onClick={() => navigate('/dashboard')}>
            Get Started <ChevronRight size={14}/>
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <span className="eyebrow"><Leaf size={13}/> AI-Powered Feed & Silage Intelligence</span>
          <h1>Smarter Feed Decisions.<br/><em>Healthier Herds.</em></h1>
          <p>AI-powered rapid screening for feed and silage quality, helping dairy farmers act early with confidence using computer vision technology.</p>
          <ul className="hero-checks">
            <li><CheckCircle size={15}/> Detect risks early before they spread</li>
            <li><CheckCircle size={15}/> Improve farm productivity & yield</li>
            <li><CheckCircle size={15}/> Ensure better herd health outcomes</li>
          </ul>
          <div className="hero-actions">
            <button className="button primary lg" onClick={() => navigate('/analysis/new')}>
              <ScanSearch size={17}/> Analyze a Sample
            </button>
            <button className="button ghost lg" onClick={() => navigate('/dashboard')}>
              Explore Platform <ChevronRight size={16}/>
            </button>
          </div>
          <div className="trust-row">
            <div className="trust-avatars">
              {['F','R','A','M'].map((l,i) => <span key={i} style={{background:['#16844b','#e1a72d','#4b9fd5','#c5453b'][i]}}>{l}</span>)}
            </div>
            <div>
              <div className="trust-stars">{'★★★★★'} <b>4.8/5</b></div>
              <small>Trusted by 500+ Farmers & Dairy Professionals</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img src="/hero_farm.jpg" alt="Dairy farm aerial view" className="hero-img"/>
            <div className="hero-overlay"/>
            <div className="preview-card floating">
              <div className="preview-card-head">
                <span><Zap size={12}/> Smart Analysis Preview</span>
                <span className="badge good">Good Quality</span>
              </div>
              <div className="preview-score-row">
                <div className="preview-ring">
                  <svg viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#e6f0e8" strokeWidth="4"/>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#20914b" strokeWidth="4"
                      strokeDasharray={`${(87/100)*113} 113`} strokeLinecap="round"
                      transform="rotate(-90 22 22)"/>
                  </svg>
                  <strong>87</strong>
                </div>
                <div>
                  <div className="preview-label">Quality Score</div>
                  <div className="preview-sublabel">/100 points</div>
                </div>
              </div>
              <div className="preview-track"><i style={{width:'87%'}}/></div>
              <dl className="preview-dl">
                <dt>Screening Risk</dt><dd className="good-text">Low Risk</dd>
                <dt>Sample Type</dt><dd>Silage</dd>
                <dt>Analyzed On</dt><dd>22 May 2026</dd>
                <dt>Confidence</dt><dd>92%</dd>
              </dl>
              <button className="text-button" onClick={() => navigate('/analysis/SF-2026-1256')}>View Full Analysis →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Strip */}
      <section className="landing-features" id="features">
        <div className="features-inner">
          <div className="section-label">Core Capabilities</div>
          <h2 className="section-title">Everything you need to protect herd health</h2>
          <div className="feature-grid">
            <FeatureCard icon={ScanSearch} title="AI Analysis" text="Rapid computer vision screening of silage and feed samples in seconds" img="/ai_analysis.jpg"/>
            <FeatureCard icon={ShieldCheck} title="Spoilage Detection" text="Identify quality risks early before they affect herd performance" img="/silage_quality.jpg"/>
            <FeatureCard icon={Package} title="Batch Intelligence" text="Track every sample batch with complete history and analytics" img="/hero_farm.jpg"/>
            <FeatureCard icon={ClipboardCheck} title="Smart Reports" text="Download detailed, actionable insights and share with your vet" img="/silage_sample.jpg"/>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how" id="how">
        <div className="how-inner">
          <div className="section-label">Simple Process</div>
          <h2 className="section-title">Get results in 3 easy steps</h2>
          <div className="steps-row">
            {[
              { n:'01', icon: Upload, title:'Upload Sample Image', text:'Take a photo of your silage or feed with any smartphone camera' },
              { n:'02', icon: ScanSearch, title:'AI Screening', text:'Our model analyzes texture, color, and visual indicators in seconds' },
              { n:'03', icon: FileText, title:'Get Smart Report', text:'Receive a quality score with actionable recommendations instantly' },
            ].map(s => (
              <div className="step" key={s.n}>
                <div className="step-number">{s.n}</div>
                <div className="step-icon"><s.icon size={22}/></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats" id="stats">
        <div className="stats-inner">
          <div className="section-label">Proven Impact</div>
          <h2 className="section-title">Trusted by farmers across India</h2>
          <div className="stats-grid">
            {[
              { val:'500+', label:'Farms using SmartFeed AI', icon: Home },
              { val:'12,000+', label:'Feed samples analyzed', icon: ScanSearch },
              { val:'92%', label:'Model accuracy rate', icon: CheckCircle },
              { val:'3 sec', label:'Average analysis time', icon: Zap },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon"><s.icon size={20}/></div>
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" id="contact">
        <div className="cta-inner">
          <div className="cta-img-wrap">
            <img src="/silage_quality.jpg" alt="Silage analysis"/>
          </div>
          <div className="cta-text">
            <span className="eyebrow"><Star size={12}/> Start Today</span>
            <h2>Ready to protect your herd?</h2>
            <p>Join hundreds of dairy professionals already using SmartFeed AI to make faster, smarter feeding decisions.</p>
            <button className="button primary lg" onClick={() => navigate('/analysis/new')}>
              <ScanSearch size={16}/> Start Free Analysis
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-mark"><Leaf size={15}/></span>
          <b>SmartFeed AI</b>
          <small>Feed & Silage Intelligence</small>
        </div>
        <small className="footer-copy">© 2026 SmartFeed AI · AI-powered screening estimates, not laboratory measurements.</small>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text, img }) {
  return (
    <div className="feature-card">
      <div className="feature-card-img">
        <img src={img} alt={title}/>
        <div className="feature-card-overlay"/>
      </div>
      <div className="feature-card-body">
        <div className="feature-card-icon"><Icon size={16}/></div>
        <b>{title}</b>
        <small>{text}</small>
      </div>
    </div>
  )
}

/* ── Mock notifications (uses current lang) ── */
function getMockNotifs(t) {
  return [
    { id:1, title:t.notif1Title, desc:t.notif1Desc, time:'2 min ago', type:'high', read:false },
    { id:2, title:t.notif2Title, desc:t.notif2Desc, time:'1 hour ago', type:'good', read:false },
    { id:3, title:t.notif3Title, desc:t.notif3Desc, time:'3 hours ago', type:'info', read:true },
    { id:4, title:t.notif4Title, desc:t.notif4Desc, time:'Yesterday', type:'info', read:true },
  ]
}

/* ─────────────────── APP SHELL ─────────────────── */
function Shell() {
  const { t, lang, switchLang, settings } = useApp()
  const [drawer, setDrawer] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState(() => getMockNotifs(t))
  const unread = notifs.filter(n => !n.read).length
  const notifRef = useRef(null)

  // Re-generate notif titles/descs when language changes
  useEffect(() => {
    setNotifs(prev => getMockNotifs(t).map((n, i) => ({ ...n, read: prev[i]?.read ?? n.read })))
  }, [lang])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })))

  const navLabels = [
    ['/dashboard', t.dashboard, BarChart3],
    ['/analysis/new', t.newAnalysis, ScanSearch],
    ['/batches', t.myBatches, Package],
    ['/history', t.history, Activity],
    ['/analytics', t.analytics, TrendingUp],
    ['/reports', t.reports, FileText],
    ['/assistant', t.aiAssistant, Bot],
    ['/profile', t.profile, UserCircle],
    ['/settings', t.settings, Settings],
  ]

  return (
    <div className={`app-shell${settings.darkMode ? ' dark-mode' : ''}`}>
      <aside className={`sidebar${drawer ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Leaf size={18}/></span>
          <div>
            <b>SmartFeed AI</b>
            <small>Feed & Silage Intelligence</small>
          </div>
        </div>
        <button className="mobile-close" onClick={() => setDrawer(false)}><X size={18}/></button>

        <div className="nav-label"><span>{t.workspace}</span></div>
        <nav>
          {navLabels.slice(0, 7).map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setDrawer(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={15}/> {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-label" style={{marginTop:'auto'}}><span>{t.account}</span></div>
        <nav>
          {navLabels.slice(7).map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setDrawer(false)}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={15}/> {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-label"><Languages size={11}/> <span>{t.language} / भाषा</span></div>
          <div className="language-grid">
            {Object.keys(LANGS).map(l => (
              <button
                key={l}
                type="button"
                className={`language${lang === l ? ' active' : ''}`}
                onClick={() => switchLang(l)}
              >{l}</button>
            ))}
          </div>
          <div className="help-box">
            <HelpCircle size={15}/>
            <div>
              <b>{t.needHelp}</b>
              <small>{t.contactSupport}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" onClick={() => setDrawer(true)}><Menu size={20}/></button>
            <div>
              <span className="kicker">SmartFeed AI / Workspace</span>
              <h2><PageTitle/></h2>
            </div>
          </div>
          <div className="topbar-right">
            <span className="status"><i/> {t.offlineReady}</span>

            {/* Notifications button + dropdown */}
            <div style={{position:'relative'}} ref={notifRef}>
              <button className="icon-btn" type="button" onClick={() => setNotifOpen(o => !o)}>
                <Bell size={17}/>
                {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-panel-head">
                    <b>{t.notifications} {unread > 0 && <span className="notif-count">{unread}</span>}</b>
                    <button type="button" className="text-button" onClick={markAllRead}>{t.markAllRead}</button>
                  </div>
                  <div className="notif-list">
                    {notifs.map(n => (
                      <div key={n.id} className={`notif-item${n.read ? ' read' : ''}`}
                        onClick={() => setNotifs(p => p.map(x => x.id===n.id ? {...x,read:true} : x))}>
                        <div className={`notif-dot-icon ${n.type}`}/>
                        <div className="notif-content">
                          <b>{n.title}</b>
                          <small>{n.desc}</small>
                          <span>{n.time}</span>
                        </div>
                        {!n.read && <div className="notif-unread-dot"/>}
                      </div>
                    ))}
                  </div>
                  <div className="notif-footer">
                    <button type="button" className="text-button" onClick={() => setNotifOpen(false)}>{t.viewAllNotif}</button>
                  </div>
                </div>
              )}
            </div>

            <div className="avatar-btn">R</div>
          </div>
        </header>

        <Routes>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/analysis/new" element={<NewAnalysis/>}/>
          <Route path="/analysis/:id" element={<Result/>}/>
          <Route path="/batches" element={<Batches/>}/>
          <Route path="/batches/:id" element={<BatchDetail/>}/>
          <Route path="/history" element={<History/>}/>
          <Route path="/analytics" element={<Analytics/>}/>
          <Route path="/assistant" element={<Assistant/>}/>
          <Route path="/reports" element={<Reports/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </main>

      {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}/>}
    </div>
  )
}

function PageTitle() {
  const location = useLocation()
  const { t } = useApp()
  if (location.pathname.startsWith('/analysis/') && !location.pathname.startsWith('/analysis/new')) return t.analysisResult
  if (location.pathname.startsWith('/batches/') && location.pathname.length > 9) return t.batchDetail
  const map = {
    '/dashboard': t.dashboard, '/analysis/new': t.newAnalysis,
    '/batches': t.myBatches, '/history': t.historyTitle,
    '/analytics': t.analyticsTitle, '/reports': t.reportsTitle,
    '/assistant': t.aiAssistant, '/profile': t.profileTitle, '/settings': t.settingsTitle,
  }
  const match = Object.entries(map).find(([path]) => location.pathname.startsWith(path))
  return match?.[1] || t.workspace
}

/* ─────────────────── DASHBOARD ─────────────────── */
function Dashboard() {
  const [range, setRange] = useState('30 days')
  const { t } = useApp()
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t.welcomeBack}</span>
          <h1>{t.dashboard}</h1>
          <p>{t.monitorDesc}</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span className="date-pill"><Calendar size={12}/> {dateStr}</span>
          <Link className="button primary" to="/analysis/new"><Plus size={15}/> {t.newAnalysis}</Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard title={t.totalAnalyses} value="128" delta={t.fromLastWeek} color="ink" icon={BarChart3}/>
        <StatCard title={t.goodQuality} value="82" delta={`64% ${t.ofTotal}`} color="good" icon={CheckCircle}/>
        <StatCard title={t.caution} value="31" delta={`24% ${t.ofTotal}`} color="caution" icon={AlertTriangle}/>
        <StatCard title={t.highRisk} value="15" delta={`12% ${t.ofTotal}`} color="high" icon={AlertTriangle}/>
      </div>

      <div className="avg-bar">
        <span className="avg-label">{t.averageScore}</span>
        <strong className="avg-val good-text">81</strong>
        <span className="avg-trend">↑ 8 {t.points}</span>
        <div className="avg-track"><div className="avg-fill" style={{width:'81%'}}/></div>
      </div>

      <div className="chart-grid">
        <ChartCard range={range} setRange={setRange}/>
        <DonutCard/>
      </div>

      <div className="recent-section">
        <div className="section-row">
          <b>{t.recentAnalyses}</b>
          <Link className="text-button" to="/history">{t.viewAll}</Link>
        </div>
        <Table
          headers={[t.sampleId, t.batchId, t.type, t.analyzedOn, t.score, t.risk, t.action]}
          rows={mockTests.slice(0,5).map(test => [
            <span className="mono">{test.id}</span>,
            test.batchId, test.type, test.analyzedOn,
            <ScorePill score={test.score}/>,
            <span className={`badge ${riskClass(test.risk)}`}>{riskIcon(test.risk)} {test.risk}</span>,
            <Link className="text-button" to={`/analysis/${test.id}`}><Eye size={13}/> {t.view}</Link>
          ])}
        />
      </div>
    </section>
  )
}

function StatCard({ title, value, delta, color, icon: Icon }) {
  const cls = color === 'good' ? 'good-text' : color === 'caution' ? 'caution-text' : color === 'high' ? 'high-text' : ''
  return (
    <div className={`card stat-card2 ${color}`}>
      <div className="stat-top">
        <small>{title}</small>
        <span className="stat-icon-wrap"><Icon size={14}/></span>
      </div>
      <strong className={cls}>{value}</strong>
      <span className={`delta ${cls}`}>{delta}</span>
    </div>
  )
}

function ScorePill({ score }) {
  const color = score >= 80 ? '#20914b' : score >= 50 ? '#ad7200' : '#c5453b'
  const bg = score >= 80 ? '#dff5e5' : score >= 50 ? '#fff0ca' : '#ffe2df'
  return <span style={{background:bg,color,padding:'4px 9px',borderRadius:99,fontWeight:800,fontSize:10}}>{score}</span>
}

function ChartCard({ range, setRange }) {
  const { t } = useApp()
  const values = trendData[range] || trendData['30 days']
  const labels = range === '7 days'
    ? ['15 May','16 May','17 May','18 May','19 May']
    : ['14 May','15 May','16 May','17 May','18 May','19 May','22 May']
  const CHART_H = 165
  return (
    <div className="card chart-card2">
      <div className="card-head">
        <div>
          <b>{t.qualityTrend}</b>
          <small>{t.avgScoreOverTime}</small>
        </div>
        <select value={range} onChange={e => setRange(e.target.value)}>
          <option>7 days</option>
          <option>30 days</option>
          <option>90 days</option>
        </select>
      </div>
      <div className="line-chart2">
        {values.map((v, i) => (
          <div className="bar-col" key={i}>
            <div className="bar2" style={{height: `${Math.round((v / 100) * CHART_H)}px`}}>
              <span className="bar-label">{v}</span>
            </div>
            <span className="bar-axis">{labels[i % labels.length]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutCard() {
  const { t } = useApp()
  return (
    <div className="card donut-card2">
      <div className="card-head">
        <div>
          <b>{t.riskDistribution}</b>
          <small>{t.currentTiers}</small>
        </div>
      </div>
      <div className="donut2">
        <strong>128<small>{t.total}</small></strong>
      </div>
      <div className="legend2">
        {[['good-bg',t.good,'64%','#dff5e5','#20914b'],['caution-bg',t.caution,'24%','#fff0ca','#ad7200'],['high-bg',t.highRisk,'12%','#ffe2df','#c5453b']].map(([cls,label,pct,bg,color]) => (
          <div className="legend-item" key={label}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <i className={cls}/>
              <span>{label}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="legend-bar-wrap">
                <div className="legend-bar" style={{width:pct,background:color}}/>
              </div>
              <b>{pct}</b>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── NEW ANALYSIS ─────────────────── */
function NewAnalysis() {
  const navigate = useNavigate()
  const { t } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)

  const handleFile = f => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = e => {
    e.preventDefault()
    setLoading(true)
    setProgress(0)
    const iv = setInterval(() => setProgress(p => { if (p >= 95) { clearInterval(iv); return p }; return p + Math.random()*15 }), 200)
    setTimeout(() => { clearInterval(iv); setProgress(100); setTimeout(() => navigate('/analysis/SF-2026-1257'), 400) }, 2200)
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{t.newAnalysisTitle}</h1>
          <p>{t.newAnalysisDesc}</p>
        </div>
        <div className="topbar-user">
          <div className="avatar-sm">R</div>
          <div>
            <b>Farmer Raj</b>
            <small>agri@farm.com</small>
          </div>
        </div>
      </div>

      <form className="analysis-layout2" onSubmit={submit}>
        {/* Upload Card */}
        <div className="card upload-card2">
          <h3>{t.uploadImage}</h3>
          <label
            className={`upload-box2${dragging?' dragging':''}`}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
            onClick={()=>fileRef.current?.click()}
          >
            {preview ? (
              <div className="upload-preview">
                <img src={preview} alt="Preview"/>
                <button type="button" className="remove-img" onClick={e=>{e.preventDefault();setFile(null);setPreview(null)}}><X size={14}/></button>
              </div>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
                <div className="upload-icon-wrap"><Upload size={28}/></div>
                <b>{t.dragDrop}</b>
                <small>{t.or}</small>
                <span className="browse-btn">{t.browseFiles}</span>
                <small className="upload-hint">{t.uploadHint}</small>
              </>
            )}
          </label>
        </div>

        {/* Form Card */}
        <div className="card form-card2">
          <h3>{t.sampleInfo}</h3>

          <label className="field-label">{t.sampleType} *
            <select name="type" className="field-input">
              <option>{t.silage}</option>
              <option>{t.feed}</option>
            </select>
          </label>

          <label className="field-label">{t.feedType} *
            <select className="field-input">
              <option>{t.maizeSilage}</option>
              <option>{t.grassSilage}</option>
              <option>{t.cattleFeed}</option>
              <option>{t.dairyConcentrate}</option>
            </select>
          </label>

          <div className="two-col">
            <label className="field-label">{t.storageDuration}
              <input type="number" defaultValue="20" className="field-input"/>
            </label>
            <label className="field-label">{t.storageCondition}
              <select className="field-input">
                <option>{t.covered}</option>
                <option>{t.open}</option>
                <option>{t.silo}</option>
              </select>
            </label>
          </div>

          <label className="field-label">{t.notes}
            <textarea className="field-input" placeholder={t.notesPlaceholder} rows={3}/>
          </label>

          {loading && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${progress}%`}}/>
              </div>
              <small>{t.analyzing} {Math.round(progress)}%</small>
            </div>
          )}

          <button className="button primary full" disabled={loading} type="submit">
            {loading ? <><RefreshCw size={15} className="spin"/> {t.processing}</> : <><ScanSearch size={15}/> {t.analyzeBtn}</>}
          </button>

          <div className="form-footer-note">
            <ShieldCheck size={13}/> {t.disclaimer}
          </div>
        </div>
      </form>
    </section>
  )
}

/* ─────────────────── RESULT PAGE ─────────────────── */
function Result() {
  const { id } = useParams()
  const { t } = useApp()
  const test = mockTests.find(x => x.id === id) || mockTests[0]

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{t.analysisResult}</h1>
          <p>{t.sampleId}: <b>{test.id}</b> · {t.batchId}: <b>{test.batchId}</b></p>
        </div>
        <button className="button secondary" onClick={() => alert(t.downloading)}>
          <Download size={14}/> {t.downloadReport}
        </button>
      </div>

      <div className="result-meta-bar">
        <span><Calendar size={12}/> {test.analyzedOn}</span>
        <span>{t.sampleTypeLabel}: <b>{test.sampleType}</b></span>
        <span>{t.modelConfidence}: <b>92%</b></span>
      </div>

      <div className="result-layout2">
        {/* Left column */}
        <div className="result-left">
          <div className="card score-card2">
            <div className="score-ring">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e8f4ec" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#20914b" strokeWidth="10"
                  strokeDasharray={`${(test.score/100)*314} 314`} strokeLinecap="round"
                  transform="rotate(-90 60 60)"/>
              </svg>
              <div className="score-inner">
                <strong>{test.score}</strong>
                <small>/100</small>
              </div>
            </div>
            <div className="score-info">
              <span className={`badge ${riskClass(test.risk)} lg`}>{test.risk}</span>
              <p>{t.modelConfidence}: <b>92%</b></p>
              <p className="muted">{t.screeningEst}</p>
              <div className="score-params">
                <div>{t.screeningRisk}</div><div className="good-text">{t.lowRisk}</div>
                <div>{t.sampleTypeLabel}</div><div>{test.sampleType}</div>
                <div>{t.analyzedOn}</div><div>{test.analyzedOn}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><b>{t.keyIndicators}</b></div>
            <ul className="check-list">
              <li>{t.ind1}</li>
              <li>{t.ind2}</li>
              <li>{t.ind3}</li>
              <li>{t.ind4}</li>
            </ul>
          </div>
        </div>

        {/* Right column */}
        <div className="result-right">
          <div className="card media-card2">
            <b>{t.uploadedImage}</b>
            <img src="/silage_sample.jpg" alt="Uploaded silage"/>
            <b>{t.aiHeatmap}</b>
            <img src="/heatmap_analysis.jpg" alt="AI Heatmap" className="heatmap-img"/>
            <div className="heatmap-legend">
              <span className="dot red"/> {t.highImpact}
              <span style={{margin:'0 8px'}}>·</span>
              <span className="dot yellow"/> {t.medium}
              <span style={{margin:'0 8px'}}>·</span>
              <span className="dot green"/> {t.lowImpact}
            </div>
          </div>

          <div className="card range-card">
            <b>{t.qualityScoreRange}</b>
            <div className="range-items">
              <span><i className="good-bg"/> {t.good} (80–100)</span>
              <span><i className="caution-bg"/> {t.caution} (50–79)</span>
              <span><i className="high-bg"/> {t.highRisk} (0–49)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── BATCHES ─────────────────── */
function Batches() {
  const navigate = useNavigate()
  const { t } = useApp()
  const [batches, setBatches] = useState(mockBatches)
  const [modal, setModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('Silage')

  const addBatch = () => {
    if (!newName.trim()) return
    setBatches(b => [{ id: newName, type: newType, feedType: newType === 'Silage' ? 'Maize Silage' : 'Cattle Feed', createdOn: 'Today', analyses: 0, status: 'Active', storage: 'Covered' }, ...b])
    setModal(false); setNewName('')
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><h1>{t.myBatchesTitle}</h1><p>{t.myBatchesDesc}</p></div>
        <button className="button primary" onClick={() => setModal(true)}><Plus size={15}/> {t.addNewBatch}</button>
      </div>
      <Table
        headers={[t.batchId, t.type, t.feedType, t.createdOn, t.totalAnalysesCount, t.batchStatus, t.action]}
        rows={batches.map(b => [
          <span className="mono">{b.id}</span>,
          b.type, b.feedType, b.createdOn,
          <span className="analyses-count">{b.analyses}</span>,
          <span className="badge good"><CheckCircle size={10}/> {t.active}</span>,
          <div style={{display:'flex',gap:6}}>
            <button className="icon-btn-sm" onClick={() => navigate(`/batches/${b.id}`)}><Eye size={13}/></button>
            <button className="icon-btn-sm danger" onClick={() => setBatches(p => p.filter(x => x.id !== b.id))}><Trash2 size={13}/></button>
          </div>
        ])}
      />
      {modal && (
        <Modal title={t.addNewBatch} close={() => setModal(false)}>
          <label className="field-label">{t.batchIdName}
            <input className="field-input" placeholder="e.g. SILAGE-006" value={newName} onChange={e => setNewName(e.target.value)}/>
          </label>
          <label className="field-label">{t.type}
            <select className="field-input" value={newType} onChange={e => setNewType(e.target.value)}>
              <option>{t.silage}</option>
              <option>{t.feed}</option>
            </select>
          </label>
          <button className="button primary full" onClick={addBatch}>{t.createBatch}</button>
        </Modal>
      )}
    </section>
  )
}

/* ─────────────────── BATCH DETAIL ─────────────────── */
function BatchDetail() {
  const { id } = useParams()
  const { t } = useApp()
  const batch = mockBatches.find(b => b.id === id) || mockBatches[0]
  const batchTests = mockTests.filter(t => t.batchId === batch.id)

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{t.batchDetail}</h1>
          <p>{t.batchId}: <b>{batch.id}</b></p>
        </div>
        <Link className="button secondary" to="/batches">← {t.backToBatches}</Link>
      </div>

      <div className="batch-detail-grid">
        <div className="card batch-info2">
          <b>{t.batchInfo}</b>
          <div className="batch-info-grid">
            {[[t.type, batch.type], [t.feedType, batch.feedType], [t.createdOn, batch.createdOn],
              [t.storage, batch.storage], [t.totalAnalysesCount, batch.analyses], [t.status, t.active]].map(([k,v]) => (
              <div key={k} className="batch-info-item">
                <small>{k}</small>
                <span className={v === t.active ? 'good-text' : ''}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card trend-card">
          <div className="card-head"><b>{t.qualityTrend}</b></div>
          <div className="mini-chart">
            {[100,89,81,84,75,78,88].map((v,i) => (
              <div className="mini-bar-col" key={i}>
                <div className="mini-bar" style={{height:`${Math.round((v/100)*130)}px`}}>
                  <span className="mini-bar-label">{v}</span>
                </div>
                <span className="mini-axis">{['16','17','18','19','20','21','22'][i]} May</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:18}}>
        <div className="card-head"><b>{t.recentAnalyses}</b></div>
        <Table
          headers={[t.sampleId, t.analyzedOn, t.score, t.risk, t.viewReport]}
          rows={(batchTests.length ? batchTests : mockTests).slice(0,5).map(t2 => [
            <span className="mono">{t2.id}</span>,
            t2.analyzedOn,
            <ScorePill score={t2.score}/>,
            <span className={`badge ${riskClass(t2.risk)}`}>{t2.risk}</span>,
            <Link className="text-button" to={`/analysis/${t2.id}`}><Eye size={13}/> {t.viewReport}</Link>
          ])}
        />
      </div>
    </section>
  )
}

/* ─────────────────── HISTORY ─────────────────── */
function History() {
  const { t } = useApp()
  const [search, setSearch] = useState('')
  const [typeF, setTypeF] = useState('All')
  const [riskF, setRiskF] = useState('All')
  const [page, setPage] = useState(1)
  const PER = 5

  const rows = mockTests.filter(x =>
    (x.id.toLowerCase().includes(search.toLowerCase()) || x.batchId.toLowerCase().includes(search.toLowerCase())) &&
    (typeF === 'All' || x.type === typeF) &&
    (riskF === 'All' || x.risk === riskF)
  )
  const paged = rows.slice((page-1)*PER, page*PER)
  const pages = Math.ceil(rows.length / PER)

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{t.historyTitle}</h1>
          <p>{t.historyDesc} {t.showing} {rows.length} {t.of} {mockTests.length} {t.records}.</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              const csv = [`${t.sampleId},${t.batchId},${t.type},${t.analyzedOn},${t.score},${t.risk}`,
                ...rows.map(r => `${r.id},${r.batchId},${r.type},"${r.analyzedOn}",${r.score},${r.risk}`)
              ].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url; a.download = 'smartfeed_history.csv'; a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download size={14}/> {t.exportCsv}
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap"><Search size={14}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder={t.searchPlaceholder}/></div>
        <select className="field-input sm" value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1)}}>
          <option value="All">{t.allTypes}</option>
          <option value="Silage">{t.silage}</option>
          <option value="Feed">{t.feed}</option>
        </select>
        <select className="field-input sm" value={riskF} onChange={e=>{setRiskF(e.target.value);setPage(1)}}>
          <option value="All">{t.allRisks}</option>
          <option value="Good">{t.good}</option>
          <option value="Caution">{t.caution}</option>
          <option value="High Risk">{t.highRisk}</option>
        </select>
      </div>

      <Table
        headers={[t.sampleId, t.batchId, t.type, t.analyzedOn, t.score, t.risk, t.action]}
        rows={paged.map(r => [
          <span className="mono">{r.id}</span>,
          r.batchId, r.type, r.analyzedOn,
          <ScorePill score={r.score}/>,
          <span className={`badge ${riskClass(r.risk)}`}>{riskIcon(r.risk)} {r.risk}</span>,
          <Link className="text-button" to={`/analysis/${r.id}`}><Eye size={13}/> {t.view}</Link>
        ])}
      />
      {pages > 1 && (
        <div className="pagination">
          {Array.from({length:pages},(_,i)=>i+1).map(p=>(
            <button key={p} className={`page-btn${page===p?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </section>
  )
}

/* ─────────────────── ANALYTICS ─────────────────── */
function Analytics() {
  const { t } = useApp()
  const [range, setRange] = useState('30 days')
  return (
    <section className="page">
      <div className="page-heading">
        <div><h1>{t.analyticsTitle}</h1><p>{t.analyticsDesc}</p></div>
        <select className="field-input sm" value={range} onChange={e => setRange(e.target.value)}>
          <option>7 days</option><option>30 days</option><option>90 days</option>
        </select>
      </div>
      <div className="analytics-grid">
        <ChartCard range={range} setRange={setRange}/>
        <DonutCard/>
        <div className="card" style={{padding:18,gridColumn:'1/-1'}}>
          <div className="card-head"><b>{t.scoreDistBatch}</b></div>
          <div className="batch-chart">
            {mockBatches.map((b,i) => {
              const score = [87,76,68,82,91][i]
              return (
                <div className="batch-bar-col" key={b.id}>
                  <div className="batch-bar" style={{height:`${Math.round((score/100)*165)}px`,background:score>=80?'#20914b':score>=50?'#e1a72d':'#d94d42'}}>
                    <span>{score}</span>
                  </div>
                  <small>{b.id}</small>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── REPORTS ─────────────────── */
function Reports() {
  const { t } = useApp()
  const [tab, setTab] = useState(t.sampleReports)
  const [reports, setReports] = useState(mockReports)
  const [modal, setModal] = useState(false)
  const [genType, setGenType] = useState(t.sampleReports)

  const rows = reports.filter(r => r.type === (tab === t.sampleReports ? 'Sample Report' : 'Batch Report'))

  const generate = () => {
    setReports(r => [{ id: `RPT-2026-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`, type: genType === t.sampleReports ? 'Sample Report' : 'Batch Report', date: 'Just now', ref: 'SF-2026-1257' }, ...r])
    setModal(false)
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><h1>{t.reportsTitle}</h1><p>{t.reportsDesc}</p></div>
        <button className="button primary" onClick={() => setModal(true)}><Plus size={15}/> {t.generateReport}</button>
      </div>

      <div className="tabs2">
        {[t.sampleReports, t.batchReports].map(tb => (
          <button key={tb} className={tab===tb?'tab-btn active':'tab-btn'} onClick={() => setTab(tb)}>
            {tb === t.sampleReports ? <FileText size={13}/> : <Package size={13}/>} {tb}
          </button>
        ))}
      </div>

      <Table
        headers={[t.sampleId, t.type, t.generatedOn, t.sampleBatch, t.action]}
        rows={rows.map(r => [
          <span className="mono">{r.id}</span>,
          <span className="badge good">{r.type}</span>,
          r.date, r.ref,
          <button className="button secondary sm" onClick={() => alert(t.downloading)}>
            <Download size={13}/> {t.export}
          </button>
        ])}
      />

      {!rows.length && <div className="empty-state"><FileText size={32}/><p>{t.noReports}</p></div>}

      {modal && (
        <Modal title={t.generateReport} close={() => setModal(false)}>
          <label className="field-label">{t.reportType}
            <select className="field-input" value={genType} onChange={e => setGenType(e.target.value)}>
              <option>{t.sampleReports}</option>
              <option>{t.batchReports}</option>
            </select>
          </label>
          <label className="field-label">{t.reference}
            <select className="field-input">
              {mockTests.map(t2 => <option key={t2.id}>{t2.id}</option>)}
            </select>
          </label>
          <button className="button primary full" onClick={generate}>{t.generate}</button>
        </Modal>
      )}
    </section>
  )
}

/* ─────────────────── AI ASSISTANT ─────────────────── */
const BOT_RESPONSES_EN = {
  score: "A score above **80** is generally a good screening signal. For scores between 50-79, monitor closely and consider corrective action. Below 50 indicates high risk — consider laboratory confirmation.",
  mold: "Mold in silage can produce mycotoxins that harm herd health. Signs include discoloration, off-smell, and heating. Discard moldy silage immediately and investigate storage conditions.",
  moisture: "Ideal moisture for maize silage is **60-70%**. Too dry causes poor fermentation, too wet can cause effluent loss. Our AI screens visual moisture indicators in the sample image.",
  default: "Check moisture content, smell, and visible mold. For high-risk screening results, confirm with a laboratory test. Ensure proper storage (covered, compacted, sealed) to preserve quality.",
}
const BOT_RESPONSES_HI = {
  score: "**80 से ऊपर** स्कोर आमतौर पर अच्छा संकेत है। 50-79 के बीच स्कोर पर नज़र रखें और सुधारात्मक कदम उठाएं। 50 से नीचे उच्च जोखिम है — प्रयोगशाला परीक्षण करें।",
  mold: "साइलेज में फफूंद माइकोटॉक्सिन पैदा कर सकती है जो पशुओं के स्वास्थ्य को नुकसान पहुंचाती है। लक्षण: रंग बदलना, बदबू, गर्म होना। फफूंदी साइलेज तुरंत हटाएं और भंडारण जांचें।",
  moisture: "मक्का साइलेज के लिए आदर्श नमी **60-70%** है। बहुत सूखा होने पर किण्वन खराब होता है, बहुत गीला होने पर रस निकलने का नुकसान होता है।",
  default: "नमी सामग्री, गंध और दिखाई देने वाली फफूंद जांचें। उच्च जोखिम परिणामों के लिए प्रयोगशाला परीक्षण करें। गुणवत्ता बनाए रखने के लिए उचित भंडारण सुनिश्चित करें।",
}

function Assistant() {
  const { t, lang } = useApp()
  const BOT = lang === 'हिंदी' ? BOT_RESPONSES_HI : BOT_RESPONSES_EN
  const [messages, setMessages] = useState([
    { from: 'bot', text: t.botGreet, time: new Date().toLocaleTimeString() }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = () => {
    if (!input.trim()) return
    const q = input.trim()
    setInput('')
    setMessages(m => [...m, { from: 'user', text: q, time: new Date().toLocaleTimeString() }])
    setTyping(true)
    setTimeout(() => {
      const lower = q.toLowerCase()
      const resp = lower.includes('score') || lower.includes('स्कोर') ? BOT.score
        : lower.includes('mold') || lower.includes('mould') || lower.includes('फफूंद') ? BOT.mold
        : lower.includes('moisture') || lower.includes('नमी') ? BOT.moisture
        : BOT.default
      setMessages(m => [...m, { from: 'bot', text: resp, time: new Date().toLocaleTimeString() }])
      setTyping(false)
    }, 800)
  }

  return (
    <section className="page assistant-page">
      <div className="page-heading">
        <div>
          <h1>{t.assistantTitle}</h1>
          <p>{t.assistantDesc}</p>
        </div>
        <button className="button secondary" onClick={() => setMessages([])}>
          <Trash2 size={14}/> {t.clearChat}
        </button>
      </div>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble-row ${m.from}`}>
              {m.from === 'bot' && <div className="bot-avatar"><Bot size={14}/></div>}
              <div className={`bubble ${m.from}`}>
                {m.text}
                <span className="bubble-time">{m.time}</span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="bubble-row bot">
              <div className="bot-avatar"><Bot size={14}/></div>
              <div className="bubble bot typing-bubble">
                <span/><span/><span/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div className="quick-prompts">
          {[t.q1, t.q2, t.q3].map(prompt => (
            <button
              key={prompt}
              type="button"
              className="quick-btn"
              onClick={() => {
                if (!prompt.trim()) return
                setMessages(m => [...m, { from: 'user', text: prompt, time: new Date().toLocaleTimeString() }])
                setTyping(true)
                setTimeout(() => {
                  const lower = prompt.toLowerCase()
                  const resp = lower.includes('score') || lower.includes('स्कोर') ? BOT.score
                    : lower.includes('mold') || lower.includes('mould') || lower.includes('फफूंद') ? BOT.mold
                    : lower.includes('moisture') || lower.includes('नमी') ? BOT.moisture
                    : BOT.default
                  setMessages(m => [...m, { from: 'bot', text: resp, time: new Date().toLocaleTimeString() }])
                  setTyping(false)
                }, 800)
              }}
            >{prompt}</button>
          ))}
        </div>

        <div className="chat-input-bar">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t.typeQuestion}
          />
          <button className="button primary send-btn" onClick={send}><Send size={16}/></button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── PROFILE ─────────────────── */
function Profile() {
  const { toast, t } = useApp()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('Farmer Raj')
  const [email, setEmail] = useState('raj@farm.com')
  const [location, setLocation] = useState('Anand, Gujarat')
  const [phone, setPhone] = useState('+91 98765 43210')
  const [farm, setFarm] = useState('Raj Dairy Farm')

  const handleSave = () => {
    setEditing(false)
    toast(t.profileUpdated, 'success')
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><h1>{t.profileTitle}</h1><p>{t.profileDesc}</p></div>
        <button type="button" className="button primary" onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? <><CheckCheck size={14}/> {t.saveChanges}</> : t.editProfile}
        </button>
      </div>
      <div className="profile-layout">
        <div className="card profile-card">
          <div className="profile-avatar">R</div>
          <h3>{name}</h3>
          <p>{email} · {location}</p>
          {editing ? (
            <div className="profile-form">
              <label className="field-label">{t.fullName}
                <input className="field-input" value={name} onChange={e=>setName(e.target.value)}/>
              </label>
              <label className="field-label">{t.email}
                <input className="field-input" value={email} onChange={e=>setEmail(e.target.value)}/>
              </label>
              <label className="field-label">{t.phone}
                <input className="field-input" value={phone} onChange={e=>setPhone(e.target.value)}/>
              </label>
              <label className="field-label">{t.farmName}
                <input className="field-input" value={farm} onChange={e=>setFarm(e.target.value)}/>
              </label>
              <label className="field-label">{t.location}
                <input className="field-input" value={location} onChange={e=>setLocation(e.target.value)}/>
              </label>
              <button type="button" className="button secondary full" onClick={() => setEditing(false)}>{t.cancel}</button>
            </div>
          ) : (
            <>
              <div className="profile-details">
                <span>📞 {phone}</span>
                <span>🏡 {farm}</span>
                <span>📍 {location}</span>
              </div>
              <div className="profile-stats">
                <div><strong>128</strong><small>{t.analyses}</small></div>
                <div><strong>5</strong><small>{t.batches}</small></div>
                <div><strong>32</strong><small>{t.reports}</small></div>
              </div>
            </>
          )}
        </div>
        <div className="card profile-activity">
          <b>{t.recentActivity}</b>
          {mockTests.slice(0,4).map(t2 => (
            <div className="activity-item" key={t2.id}>
              <div className={`activity-dot ${riskClass(t2.risk)}`}/>
              <div>
                <b>{t2.id}</b>
                <small>{t2.analyzedOn}</small>
              </div>
              <span className={`badge ${riskClass(t2.risk)}`}>{t2.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── SETTINGS ─────────────────── */
function SettingsPage() {
  const { settings, setSetting, lang, switchLang, toast, t } = useApp()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    toast(t.settingsSaved, 'success')
    setTimeout(() => setSaved(false), 2000)
  }

  const SETTING_ROWS = [
    { key: 'notifications', title: t.pushNotif, desc: t.pushNotifDesc, icon: Bell },
    { key: 'offline', title: t.offlineMode, desc: t.offlineModeDesc, icon: CheckCircle },
    { key: 'darkMode', title: t.darkMode, desc: t.darkModeDesc, icon: Settings },
  ]

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <h1>{t.settingsTitle}</h1>
          <p>{t.settingsDesc}</p>
        </div>
        <button type="button" className={`button${saved ? ' secondary' : ' primary'}`} onClick={handleSave}>
          {saved ? <><CheckCheck size={14}/> {t.saved}</> : t.saveSettings}
        </button>
      </div>

      <div className="settings-layout">
        <div className="settings-section-title">{t.preferences}</div>
        {SETTING_ROWS.map(s => (
          <div className="card setting-row" key={s.key}>
            <div className="setting-icon"><s.icon size={16}/></div>
            <div className="setting-text">
              <b>{s.title}</b>
              <small>{s.desc}</small>
            </div>
            <div className="toggle-wrap">
              <span className={`toggle-label${settings[s.key] ? ' on' : ''}`}>
                {settings[s.key] ? t.on : t.off}
              </span>
              <button
                type="button"
                className={`toggle${settings[s.key] ? ' on' : ''}`}
                onClick={() => setSetting(s.key, !settings[s.key])}
                aria-label={`Toggle ${s.title}`}
              >
                <span/>
              </button>
            </div>
          </div>
        ))}

        <div className="settings-section-title" style={{marginTop:16}}>{t.langRegion}</div>
        <div className="card setting-row">
          <div className="setting-icon"><Languages size={16}/></div>
          <div className="setting-text">
            <b>{t.interfaceLang}</b>
            <small>{t.interfaceLangDesc}</small>
          </div>
          <div className="lang-btn-group">
            {Object.keys(LANGS).map(l => (
              <button key={l} type="button" className={`lang-pill${lang === l ? ' active' : ''}`} onClick={() => switchLang(l)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="settings-section-title" style={{marginTop:16}}>{t.dataPrivacy}</div>
        <div className="card setting-row">
          <div className="setting-icon"><Trash2 size={16}/></div>
          <div className="setting-text">
            <b>{t.clearCache}</b>
            <small>{t.clearCacheDesc}</small>
          </div>
          <button type="button" className="button secondary sm" onClick={() => toast(t.toastCacheCleared, 'success')}>
            {t.clearCacheBtn}
          </button>
        </div>
        <div className="card setting-row">
          <div className="setting-icon"><Download size={16}/></div>
          <div className="setting-text">
            <b>{t.exportAll}</b>
            <small>{t.exportAllDesc}</small>
          </div>
          <button type="button" className="button secondary sm" onClick={() => toast(t.toastExportStarted, 'info')}>
            <Download size={13}/> {t.export}
          </button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── LOGIN ─────────────────── */
function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')

  return (
    <section className="auth-page">
      <div className="auth-bg"/>
      <div className="card auth-card">
        <div className="auth-brand">
          <span className="brand-mark"><Leaf size={20}/></span>
          <b>SmartFeed AI</b>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to your SmartFeed workspace.</p>
        <label className="field-label">Phone Number
          <input className="field-input" placeholder="Enter your phone number" value={phone} onChange={e=>setPhone(e.target.value)}/>
        </label>
        <label className="field-label">Password
          <input className="field-input" type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)}/>
        </label>
        <button className="button primary full" onClick={() => navigate('/dashboard')}>
          Login to SmartFeed
        </button>
        <div className="auth-footer">
          <button className="text-button" onClick={() => navigate('/dashboard')}>Continue as Guest →</button>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── SHARED COMPONENTS ─────────────────── */
function Table({ headers, rows }) {
  return (
    <div className="table-wrap card">
      <table>
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}
        </tbody>
      </table>
      {!rows.length && <div className="empty">No records found.</div>}
    </div>
  )
}

function Modal({ title, close, children }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal card">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={close}><X size={18}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default App
