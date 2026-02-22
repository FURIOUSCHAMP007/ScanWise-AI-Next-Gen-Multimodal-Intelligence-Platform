import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  BrainCircuit, 
  Zap, 
  Scan, 
  Users, 
  Link2, 
  Heart, 
  LayoutDashboard,
  Sparkles,
  ChevronRight,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { AppView } from '../types';

interface HomeModuleProps {
  onNavigate: (view: AppView) => void;
  onLoadDemo: () => void;
}

const HomeModule: React.FC<HomeModuleProps> = ({ onNavigate, onLoadDemo }) => {
  const features = [
    {
      id: 'ingestion',
      icon: Scan,
      title: 'Multimodal Ingestion',
      desc: 'Seamlessly ingest DICOM imagery, laboratory reports, and raw clinical notes with AI modality detection.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'analysis',
      icon: BrainCircuit,
      title: 'Clinical Reasoning',
      desc: 'Leverages Gemini 3 Pro to correlate visual findings with laboratory data for high-confidence diagnostic reasoning.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: 'Intelligent Triage',
      desc: 'Real-time operational dashboard for medical centers that prioritizes high-risk cases based on AI stratification.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      id: 'patient',
      icon: Users,
      title: 'Patient-Centric Comm',
      desc: 'Translates technical medical jargon into empathetic summaries to improve patient health literacy.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      id: 'transplant',
      icon: Heart,
      title: 'Transplant Intelligence',
      desc: 'Automated donor matching following international standards, calculating MELD scores and HLA compatibility.',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      id: 'ehr',
      icon: Link2,
      title: 'EHR Interop (FHIR)',
      desc: 'Bi-directional synchronization with modern systems using standardized FHIR R4 and HL7 data mappings.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    }
  ];

  return (
    <div className="space-y-24 animate-in fade-in duration-1000 pb-20">
      <section className="relative pt-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
        
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">v2.5 Agentic System</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1]">
            ScanWise AI – Next-Gen <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Multimodal Intelligence</span> Platform
          </h1>
          
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
            Unified Diagnostic Reasoning Across Imaging, Laboratories, and EHR.
          </p>

          <div className="flex items-center justify-center gap-6 pt-6">
            <button 
              onClick={() => onNavigate('ingestion')}
              className="bg-white text-slate-950 px-10 py-5 rounded-[24px] font-black text-lg flex items-center gap-3 transition-all shadow-2xl shadow-white/5 hover:scale-105 active:scale-95"
            >
              Start New Analysis <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onLoadDemo}
              className="bg-slate-800 text-white border border-white/5 px-10 py-5 rounded-[24px] font-black text-lg flex items-center gap-3 transition-all hover:bg-slate-700 active:scale-95"
            >
              Watch Demo <Zap className="w-5 h-5 text-amber-500" />
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Integrated Clinical Modules</h2>
          <p className="text-slate-500 font-medium">Modular architecture localized for modern healthcare ecosystems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div 
              key={f.id}
              onClick={() => onNavigate(f.id as AppView)}
              className="group bg-[#16191F] border border-white/5 p-10 rounded-[48px] hover:border-blue-500/30 transition-all cursor-pointer shadow-xl hover:shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                <f.icon className="w-32 h-32" />
              </div>
              
              <div className={`${f.bg} ${f.color} w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8">
                {f.desc}
              </p>
              
              <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                Explore Module <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black tracking-tight">Agentic Reasoning Hub.</h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Our system uses a dual-engine approach to medical reasoning. Gemini 3 Flash handles rapid OCR, while Gemini 3 Pro provides deep clinical correlation for the patient population.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-[#16191F] border border-white/5 rounded-3xl space-y-3">
              <div className="bg-emerald-500/10 w-fit p-3 rounded-2xl mb-2">
                <Lock className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="font-bold">PII Anonymization</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Automatic de-identification of imaging before processing.</p>
            </div>
            <div className="p-6 bg-[#16191F] border border-white/5 rounded-3xl space-y-3">
              <div className="bg-blue-500/10 w-fit p-3 rounded-2xl mb-2">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-bold">FHIR Integration</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Standardized communication for clinical interoperability.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
          <div className="relative bg-[#16191F] border border-white/10 p-10 rounded-[60px] shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl animate-bounce">
                <ShieldCheck className="w-12 h-12 text-white" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-black">Clinical Standard Compliance</p>
                <p className="text-slate-500 font-medium">Enterprise-grade security for patient healthcare data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600/5 to-transparent border border-white/5 p-12 rounded-[60px] flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center">
            <Globe className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black">National Registry Sync</h3>
            <p className="text-slate-500 font-medium">Connected to national transplant data nodes and registries.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('transplant')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-500/20"
        >
          Check Registry
        </button>
      </section>

      <footer className="text-center space-y-6 pt-10 border-t border-white/5">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-xl">
            <Scan className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-2xl font-bold">ScanWise AI</span>
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Next-Gen Multimodal Clinical Intelligence Platform</p>
        <p className="text-slate-700 text-[9px] font-bold uppercase tracking-widest">Unified Diagnostic Reasoning Across Imaging, Laboratories, and EHR</p>
      </footer>
    </div>
  );
};

export default HomeModule;