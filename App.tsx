import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  BrainCircuit, 
  Users, 
  LayoutDashboard,
  Bell,
  Search,
  Settings,
  ShieldCheck,
  Link2,
  Scan,
  Sparkles,
  Key,
  ExternalLink,
  AlertCircle,
  Heart,
  Home,
  Menu
} from 'lucide-react';
import { AppView, MedicalScan, AIDiagnosisResult, DecisionSupport, PatientCommunication, LabReportInsights, DiagnosticModality, ResearchInsight } from './types';
import Dashboard from './components/Dashboard';
import IngestionModule from './components/IngestionModule';
import AnalysisModule from './components/AnalysisModule';
import PatientModule from './components/PatientModule';
import EHRIntegration from './components/EHRIntegration';
import TransplantModule from './components/TransplantModule';
import HomeModule from './components/HomeModule';

const ScanWiseLogo = () => (
  <div className="flex items-center gap-4 group cursor-pointer select-none">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-400/30 transition-all duration-500"></div>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer Hexagon Frame */}
        <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full text-slate-700 group-hover:text-blue-500/50 transition-colors duration-500" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" />
        </svg>
        {/* Inner Scanning Core */}
        <div className="relative z-10 w-6 h-6 flex items-center justify-center">
          <Scan className="w-full h-full text-blue-400 group-hover:text-white transition-colors duration-300" />
          <div className="absolute inset-0 bg-blue-400/20 scale-150 rounded-full animate-ping opacity-20"></div>
        </div>
      </div>
    </div>
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <span className="text-xl font-black tracking-tight text-white uppercase italic">Scan</span>
        <span className="text-xl font-light tracking-tight text-slate-400 uppercase italic">Wise</span>
        <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded shadow-lg shadow-blue-500/20">AI</span>
      </div>
      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-0.5 leading-none">Clinical Intelligence</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeScan, setActiveScan] = useState<MedicalScan | null>(null);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisResult | null>(null);
  const [labInsights, setLabInsights] = useState<LabReportInsights | null>(null);
  const [decision, setDecision] = useState<DecisionSupport | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientCommunication | null>(null);
  const [ehrSynced, setEhrSynced] = useState(false);

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'System Overview' },
    { id: 'ingestion', icon: Upload, label: 'Secure Upload' },
    { id: 'analysis', icon: Scan, label: 'Clinical Analysis' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Triage Dashboard' },
    { id: 'patient', icon: Users, label: 'Patient Summary' },
    { id: 'transplant', icon: Heart, label: 'Transplant Intelligence' },
    { id: 'ehr', icon: Link2, label: 'EHR Bridge' },
  ];

  const loadDemo = () => {
    const demoScan: MedicalScan = {
      id: 'DEMO-9921',
      patientId: 'PAT-9912',
      modality: DiagnosticModality.MRI,
      region: 'Brain',
      timestamp: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&q=80&w=1000',
      status: 'analyzed'
    };

    const demoDiag: AIDiagnosisResult = {
      abnormalities: ['T2/FLAIR Hyperintensities', 'Periventricular Lesions'],
      rareFindings: ['Incidental Pineal Cyst', 'Anatomical Variant: Persistent Trigeminal Artery'],
      confidence: 0.94,
      observations: 'The MRI reveals multiple focal high-signal intensities in the periventricular white matter, consistent with demyelinating disease patterns. Incidental detection of a small benign pineal cyst and a rare vascular anatomical variant.',
      riskLevel: 'Medium',
      findings: ['Normal ventricular size', 'Intact cortical ribbon', 'Symmetric sulci'],
      visualHeatmapCoord: { x: 420, y: 380, label: 'Primary Lesion Site' }
    };

    const demoLab: LabReportInsights = {
      summary: 'CSF analysis shows oligoclonal bands. Vitamin B12 levels normal. Autoimmune panel pending.',
      parameters: [
        { name: 'Oligoclonal Bands', value: 'Positive', unit: 'Status', range: 'Negative' },
        { name: 'Vitamin B12', value: '450', unit: 'pg/mL', range: '200-900' }
      ]
    };

    const demoDecision: DecisionSupport = {
      triagePriority: 'PRIORITY',
      suggestedSteps: ['Neurology consult within 48h', 'Visual evoked potentials', 'Follow-up MRI in 6 months'],
      clinicalContext: 'Patient presenting with intermittent numbness and optic neuritis.',
      reasoning: 'Visual findings combined with CSF results strongly suggest a demyelinating process. Rare vascular variants noted but unlikely causative. Priority triage is required for early DMT initiation.'
    };

    const demoPatient: PatientCommunication = {
      simpleExplanation: 'The scan shows some small areas in the brain that are reacting differently to the magnet. These spots often relate to how the brain sends signals to the rest of the body. We also found some rare anatomical details that are harmless but good to know.',
      nextSteps: 'You will meet with a Brain Specialist (Neurologist) to discuss these results. No emergency treatment is needed right now.'
    };

    setActiveScan(demoScan);
    setDiagnosis(demoDiag);
    setLabInsights(demoLab);
    setDecision(demoDecision);
    setPatientInfo(demoPatient);
    setEhrSynced(false);
    setCurrentView('analysis');
  };

  return (
    <div className="flex h-screen bg-[#0F1115] text-slate-100 overflow-hidden font-['Inter']">
      {/* Sidebar */}
      <aside className="w-[340px] bg-[#10141D] border-r border-white/5 flex flex-col hidden md:flex">
        <div 
          onClick={() => setCurrentView('home')}
          className="px-10 py-12"
        >
          <ScanWiseLogo />
        </div>

        <nav className="flex-1 px-8 space-y-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AppView)}
              className={`w-full flex items-center gap-6 px-6 py-5 rounded-[20px] transition-all duration-300 text-left ${
                currentView === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <item.icon className={`w-6 h-6 shrink-0 transition-transform duration-500 ${currentView === item.id ? 'scale-110 text-blue-400' : ''}`} />
              <span className={`font-black text-[11px] uppercase tracking-[0.15em] leading-[1.4] transition-colors ${currentView === item.id ? 'text-blue-400' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          <div className="bg-[#16191F] border border-white/5 p-6 rounded-[24px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-blue-500/10"><Sparkles className="w-12 h-12" /></div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Agentic Engine</p>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mb-4">Correlating symptoms, vitals, or reports for faster triage.</p>
            <button 
              onClick={loadDemo}
              className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95"
            >
              Load Demo Case
            </button>
          </div>
          <button className="flex items-center gap-3 text-slate-600 hover:text-slate-100 text-[10px] font-black uppercase tracking-widest px-2 transition-colors">
            <Settings className="w-4 h-4" /> System Config
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#0F1115]">
        <header className="sticky top-0 z-50 bg-[#0F1115]/80 backdrop-blur-xl border-b border-white/5 px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
             <div className="relative max-w-md w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find patient or scan ID..."
                className="w-full bg-[#16191F] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Secure Gateway
            </div>
            <button className="relative p-2.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-[#0F1115]"></span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right">
                <p className="text-sm font-bold">Faizan Ahmed</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Admin</p>
              </div>
              <img 
                src="https://picsum.photos/seed/scanwise/100/100" 
                className="w-11 h-11 rounded-2xl border-2 border-white/10 object-cover ring-4 ring-blue-500/5"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {currentView === 'home' && (
            <HomeModule onNavigate={setCurrentView} onLoadDemo={loadDemo} />
          )}
          {currentView === 'dashboard' && (
            <Dashboard 
              onSelectView={setCurrentView} 
              activeScan={activeScan}
              diagnosis={diagnosis}
              onLoadDemo={loadDemo}
            />
          )}
          {currentView === 'ingestion' && (
            <IngestionModule 
              onScanComplete={(scan) => {
                setActiveScan(scan);
                setCurrentView('analysis');
              }}
              onLoadDemo={loadDemo}
            />
          )}
          {currentView === 'analysis' && (
            <AnalysisModule 
              scan={activeScan}
              onAnalysisComplete={(res, lab, dec, pat) => {
                setDiagnosis(res);
                setLabInsights(lab);
                setDecision(dec);
                setPatientInfo(pat);
              }}
              diagnosis={diagnosis}
              labInsights={labInsights}
              decision={decision}
              patientInfo={patientInfo}
              onEhrPush={() => setEhrSynced(true)}
              ehrSynced={ehrSynced}
              onLoadDemo={loadDemo}
              onGoToUpload={() => setCurrentView('ingestion')}
            />
          )}
          {currentView === 'transplant' && (
            <TransplantModule 
              activeScan={activeScan}
              labInsights={labInsights}
              diagnosis={diagnosis}
            />
          )}
          {currentView === 'patient' && (
            <PatientModule 
              scan={activeScan}
              diagnosis={diagnosis}
              decision={decision}
              patientInfo={patientInfo}
            />
          )}
          {currentView === 'ehr' && (
            <EHRIntegration />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;