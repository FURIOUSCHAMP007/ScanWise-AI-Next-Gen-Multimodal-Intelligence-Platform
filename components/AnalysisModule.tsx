import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BrainCircuit, 
  Stethoscope, 
  ShieldAlert, 
  RefreshCw, 
  Target, 
  CloudUpload, 
  CheckCircle2, 
  Workflow, 
  Sparkles, 
  Zap, 
  Globe, 
  ExternalLink, 
  BookOpen, 
  Users, 
  Lightbulb, 
  Table as TableIcon,
  ShieldQuestion,
  TrendingUp,
  Wind,
  Heart,
  Plus,
  ChevronRight,
  Info,
  Loader2,
  Scan as ScanIcon,
  FileSearch,
  Dna,
  ArrowRight,
  MessageSquareText,
  ChevronDown
} from 'lucide-react';
import { MedicalScan, AIDiagnosisResult, DecisionSupport, PatientCommunication, LabReportInsights, ResearchInsight } from '../types';
import { analyzeMedicalScan, parseLabReport, generateAgenticReasoning, generatePatientFriendlySummary, searchClinicalTrials, summarizeResearchPaper } from '../services/geminiService';
import { pushToEHR } from '../services/emrService';
import LiveAssistant from './LiveAssistant';

interface AnalysisModuleProps {
  scan: MedicalScan | null;
  diagnosis: AIDiagnosisResult | null;
  labInsights: LabReportInsights | null;
  decision: DecisionSupport | null;
  patientInfo: PatientCommunication | null;
  onAnalysisComplete: (res: AIDiagnosisResult, lab: LabReportInsights | null, dec: DecisionSupport, pat: PatientCommunication) => void;
  onEhrPush: () => void;
  ehrSynced: boolean;
  onLoadDemo: () => void;
  onGoToUpload: () => void;
}

const AnalysisModule: React.FC<AnalysisModuleProps> = ({ 
  scan, diagnosis, labInsights, decision, patientInfo, 
  onAnalysisComplete, onEhrPush, ehrSynced, onLoadDemo, onGoToUpload
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [pushing, setPushing] = useState(false);
  const [viewPerspective, setViewPerspective] = useState<'patient' | 'professional' | 'research'>('patient');
  const [research, setResearch] = useState<ResearchInsight | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [paperSummaries, setPaperSummaries] = useState<Record<number, string>>({});
  const [isLabTableExpanded, setIsLabTableExpanded] = useState(false);

  const runFullAnalysis = async () => {
    if (!scan) return;
    setIsAnalyzing(true);
    try {
      setAnalysisStep(1);
      const visualRes = await analyzeMedicalScan(scan.imageUrl, scan.modality, scan.region);
      
      setAnalysisStep(2);
      let labs = null;
      if (scan.reportUrl) {
        labs = await parseLabReport(scan.reportUrl);
      }

      setAnalysisStep(3);
      const clinicalDecision = await generateAgenticReasoning(visualRes, labs, "Clinical assessment in progress.");

      setAnalysisStep(4);
      const patientComm = await generatePatientFriendlySummary(visualRes, clinicalDecision);

      onAnalysisComplete(visualRes, labs, clinicalDecision, patientComm);
    } catch (e) {
      console.error("Analysis Pipeline Failed:", e);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep(0);
    }
  };

  const fetchResearch = async () => {
    if (!diagnosis) return;
    setIsResearching(true);
    try {
      const res = await searchClinicalTrials(diagnosis.abnormalities.join(', '), scan?.region || 'Body');
      setResearch(res);
      
      if (res.papers && res.papers.length > 0) {
        res.papers.slice(0, 3).forEach(async (paper, idx) => {
          try {
            const summary = await summarizeResearchPaper(paper.title, paper.snippet);
            setPaperSummaries(prev => ({ ...prev, [idx]: summary }));
          } catch (e) {
            console.error("Paper summarization failed", e);
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResearching(false);
    }
  };

  useEffect(() => {
    if (viewPerspective === 'research' && !research && diagnosis) fetchResearch();
  }, [viewPerspective, diagnosis]);

  if (!scan) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in zoom-in duration-1000">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div className="relative w-24 h-24 bg-slate-800 border border-white/10 rounded-[32px] flex items-center justify-center shadow-2xl">
          <Workflow className="w-12 h-12 text-blue-500 animate-pulse" />
        </div>
      </div>
      <h3 className="text-3xl font-black mb-4">No Active Case</h3>
      <p className="text-slate-500 mb-8 max-w-sm font-medium">Load a patient case to begin clinical and research correlation.</p>
      <button onClick={onLoadDemo} className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-10 py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-blue-600/20 active:scale-95">
        <Sparkles className="w-5 h-5" /> Load Sample Brain MRI
      </button>
    </div>
  );

  if (isAnalyzing || (!diagnosis && scan)) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000 py-10">
        <div className="text-center space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-2 rounded-2xl inline-flex items-center gap-3 mb-4">
             <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Clinical Engine Active</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">Processing Patient <span className="text-blue-500">Insights</span></h2>
          <p className="text-slate-500 font-medium">Correlating visual markers with multi-agent reasoning chains.</p>
        </div>

        <div className="bg-[#16191F] border border-white/5 p-12 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden">
          {!isAnalyzing ? (
            <div className="flex flex-col items-center py-10 space-y-8 text-center">
               <div className="w-32 h-32 bg-slate-900 border border-white/10 rounded-[40px] flex items-center justify-center relative">
                  <ScanIcon className="w-12 h-12 text-blue-500" />
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
               </div>
               <div className="space-y-2">
                 <p className="text-xl font-bold">Data Ingested Successfully</p>
                 <p className="text-slate-500 text-sm max-w-xs">Scan and metadata are ready for the Clinical Reasoning Pipeline.</p>
               </div>
               <button 
                onClick={runFullAnalysis}
                className="bg-white text-slate-950 px-12 py-5 rounded-[28px] font-black text-lg flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl"
               >
                 Initialize AI Pipeline <ArrowRight className="w-6 h-6" />
               </button>
            </div>
          ) : (
            <div className="space-y-8 py-6">
              {[
                { id: 1, label: 'Visual Engine', desc: 'Analyzing ROI & abnormalities', icon: ScanIcon },
                { id: 2, label: 'Laboratory Engine', desc: 'Parsing lab reports & biomarkers', icon: Dna },
                { id: 3, label: 'Reasoning Engine', desc: 'Correlating cross-modal findings', icon: BrainCircuit },
                { id: 4, label: 'Translation Engine', desc: 'Generating patient narratives', icon: MessageSquareText },
              ].map((step) => (
                <div key={step.id} className="flex items-center gap-6 group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    analysisStep > step.id ? 'bg-emerald-500 text-white' : 
                    analysisStep === step.id ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-600'
                  }`}>
                    {analysisStep > step.id ? <CheckCircle2 className="w-7 h-7" /> : <step.icon className="w-7 h-7" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black uppercase tracking-widest ${analysisStep >= step.id ? 'text-white' : 'text-slate-600'}`}>
                      {step.label} {analysisStep === step.id && <span className="ml-2 text-[8px] animate-pulse">Running...</span>}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{step.desc}</p>
                  </div>
                  {analysisStep === step.id && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 relative pb-20">
      <LiveAssistant isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} context={diagnosis?.observations || ""} />

      <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto mb-10">
        <div className="flex items-center p-2 bg-[#16191F] border border-white/5 rounded-3xl shadow-xl flex-1">
          <button 
            onClick={() => setViewPerspective('patient')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewPerspective === 'patient' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Heart className="w-4 h-4" /> Patient
          </button>
          <button 
            onClick={() => setViewPerspective('professional')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewPerspective === 'professional' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Stethoscope className="w-4 h-4" /> Professional
          </button>
          <button 
            onClick={() => setViewPerspective('research')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewPerspective === 'research' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Globe className="w-4 h-4" /> Research Hub
          </button>
        </div>
        <button onClick={() => setIsLiveOpen(true)} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all">
          <Users className="w-4 h-4" /> Peer-Review
        </button>
      </div>

      {viewPerspective === 'research' ? (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-[#16191F] border border-purple-500/20 p-12 rounded-[56px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-1000">
              <Globe className="w-64 h-64 text-purple-500" />
            </div>
            <div className="relative z-10 space-y-8 max-w-5xl">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full text-purple-400 text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> 2024–2025 Clinical Landscape
              </div>
              <h2 className="text-5xl font-black tracking-tight leading-tight">Cerebral Small Vessel Disease: <br/><span className="text-purple-400">The "Active Lesion" Paradigm</span></h2>
              <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] backdrop-blur-md">
                <p className="text-xl text-purple-50 font-medium leading-relaxed italic">
                  "Recent research highlights a shift from viewing T2/FLAIR hyperintensities as static 'scars' to active markers of brain health. Reversibility is now seen as possible with aggressive BP control."
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-black flex items-center gap-3"><Lightbulb className="w-7 h-7 text-purple-400" /> Pathophysiology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Glymphatic Failure', icon: Wind, desc: ' Cleansing failure leads to fluid stagnation in white matter, appearing as T2/FLAIR hyperintensities.' },
                    { title: 'BBB Leakage', icon: ShieldQuestion, desc: 'Breakdown allows fibrinogen to leak into the brain, identifying tissue "at risk" of lesions.' },
                  ].map((m, i) => (
                    <div key={i} className="bg-[#16191F] border border-white/5 p-8 rounded-[40px] hover:border-purple-500/30 transition-all">
                      <m.icon className="w-8 h-8 text-purple-500 mb-4" />
                      <h4 className="text-xl font-bold mb-2">{m.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#16191F] border border-white/5 p-10 rounded-[56px] shadow-2xl">
                <h3 className="text-2xl font-black flex items-center gap-3 mb-8"><TableIcon className="w-7 h-7 text-purple-400" /> Trials Table</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase">Trial</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase">Intervention</th>
                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase">Key Finding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'SPRINT MIND', agent: 'Intensive BP', finding: 'Reduced accrual of WML volume.' },
                        { name: 'LACI-3', agent: 'Cilostazol + ISMN', finding: 'Stabilization of vessels.' },
                        { name: 'CCMR-Two', agent: 'Metformin + Clemastine', finding: 'Improved remyelination markers.' },
                      ].map((trial, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="py-6 font-bold text-slate-100">{trial.name}</td>
                          <td className="py-6 text-sm text-slate-400 font-medium">{trial.agent}</td>
                          <td className="py-6 text-sm text-purple-300 font-medium italic">{trial.finding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-10">
              <div className="bg-purple-600/10 border border-purple-500/20 p-10 rounded-[48px] shadow-2xl space-y-8">
                <h3 className="text-xl font-black text-purple-400 flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Takeaways</h3>
                <div className="space-y-4">
                  {['BP Target <130 mmHg', 'Quality sleep for glymphatic health', 'Manage glucose/lipids', 'Sleep hygiene optimization'].map((t, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#16191F] border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-6">
                <h3 className="text-lg font-black flex items-center gap-3"><BookOpen className="w-6 h-6 text-blue-500" /> References</h3>
                {research?.papers.slice(0, 3).map((p, i) => (
                  <div key={i} className="space-y-3 pb-2 border-b border-white/5 last:border-0">
                    <a href={p.url} target="_blank" className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group">
                      <span className="text-xs font-bold text-slate-100 truncate max-w-[180px]">{p.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-blue-500" />
                    </a>
                    {paperSummaries[i] ? (
                      <p className="px-4 text-[10px] text-slate-500 font-medium leading-relaxed italic animate-in fade-in slide-in-from-top-1">
                        {paperSummaries[i]}
                      </p>
                    ) : (
                      <div className="px-4 flex items-center gap-2 text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] opacity-40">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Fetching AI Summary...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#16191F] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl ring-1 ring-white/5 relative">
              <div className="relative aspect-square bg-black flex items-center justify-center">
                <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-contain opacity-80" />
                {diagnosis?.visualHeatmapCoord && (
                  <div className="absolute border-2 border-rose-500/40 rounded-full flex flex-col items-center justify-center" 
                       style={{ left: `${diagnosis.visualHeatmapCoord.x / 10}%`, top: `${diagnosis.visualHeatmapCoord.y / 10}%`, width: '140px', height: '140px', transform: 'translate(-50%, -50%)', background: 'rgba(244,63,94,0.05)' }}>
                    <div className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-xl">ROI Mapping</div>
                  </div>
                )}
              </div>
            </div>

            {viewPerspective === 'patient' && patientInfo && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[40px] space-y-8 shadow-2xl animate-in fade-in">
                <h3 className="text-2xl font-black text-emerald-400 flex items-center gap-3">
                  <Heart className="w-7 h-7" /> Patient-Friendly Summary
                </h3>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                  <p className="text-xl text-emerald-50 font-medium leading-relaxed italic">
                    "{patientInfo.simpleExplanation}"
                  </p>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recommended Next Steps
                  </p>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed">{patientInfo.nextSteps}</p>
                </div>
              </div>
            )}

            {viewPerspective === 'professional' && diagnosis && (
              <div className="bg-[#16191F] border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl animate-in slide-in-from-bottom-4">
                <h3 className="text-2xl font-extrabold flex items-center gap-3 text-white">
                  <ShieldAlert className="w-7 h-7 text-blue-500" /> Technical Findings
                </h3>
                <div className="space-y-6">
                  <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-3xl">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Primary Observations</p>
                    <p className="text-slate-300 leading-relaxed text-sm font-medium">{diagnosis.observations}</p>
                  </div>
                  {diagnosis.rareFindings && diagnosis.rareFindings.length > 0 && (
                    <div className="bg-purple-600/5 border border-purple-500/20 p-8 rounded-3xl">
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Rare / Incidental Detections</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {diagnosis.rareFindings.map((f, i) => (
                          <div key={i} className="flex items-center gap-3 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-xs font-bold text-purple-100">
                            <Sparkles className="w-4 h-4 text-purple-400" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#16191F] border border-white/5 p-10 rounded-[40px] space-y-10 shadow-2xl ring-2 ring-blue-500/10">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black">Clinical Triage</h3>
                 <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${decision?.triagePriority === 'EMERGENCY' ? 'bg-rose-500 text-white' : decision?.triagePriority === 'PRIORITY' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}>
                    {decision?.triagePriority || 'PENDING'}
                 </div>
              </div>
              
              {decision && (
                <div className="space-y-6">
                  <div className="bg-blue-600/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Info className="w-4 h-4" /> AI Reasoning Context
                    </p>
                    <p className="text-sm font-medium text-slate-300 italic leading-relaxed">"{decision.reasoning}"</p>
                  </div>
                  
                  <button 
                    onClick={async () => { setPushing(true); await pushToEHR(scan.patientId, diagnosis!); onEhrPush(); setPushing(false); }} 
                    disabled={pushing || ehrSynced} 
                    className={`w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-4 transition-all ${ehrSynced ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white text-slate-950 hover:bg-blue-50'}`}
                  >
                    {pushing ? <RefreshCw className="w-6 h-6 animate-spin" /> : ehrSynced ? <CheckCircle2 className="w-6 h-6" /> : <CloudUpload className="w-6 h-6" />}
                    {pushing ? 'Syncing...' : ehrSynced ? 'Sync Complete' : 'Push to EHR'}
                  </button>
                </div>
              )}
            </div>

            {labInsights && (
              <div className="bg-[#16191F] border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-6">
                <button 
                  onClick={() => setIsLabTableExpanded(!isLabTableExpanded)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-xl">
                      <Workflow className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Laboratory Findings</h3>
                  </div>
                  <div className={`p-2 rounded-lg bg-slate-800 transition-all ${isLabTableExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ${isLabTableExpanded ? 'max-h-[1000px]' : 'max-h-[180px]'}`}>
                  <div className="space-y-4">
                    {!isLabTableExpanded ? (
                      <div className="space-y-3">
                        {labInsights.parameters.slice(0, 2).map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.name}</span>
                            <span className="text-sm font-black text-white">{p.value} {p.unit}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-[0.2em] pt-2">
                          + {labInsights.parameters.length - 2} more parameters
                        </p>
                      </div>
                    ) : (
                      <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-900 border-b border-white/5">
                              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Parameter</th>
                              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Result</th>
                              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Ref Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {labInsights.parameters.map((p, i) => (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3 text-[11px] font-bold text-slate-300">{p.name}</td>
                                <td className="px-4 py-3">
                                  <span className="text-[11px] font-black text-white">{p.value}</span>
                                  <span className="text-[9px] ml-1 text-slate-500 font-medium">{p.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{p.range}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisModule;