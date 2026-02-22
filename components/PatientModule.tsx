
import React from 'react';
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Calendar,
  PhoneCall,
  Info,
  AlertCircle,
  Activity,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { MedicalScan, AIDiagnosisResult, PatientCommunication, DecisionSupport } from '../types';

interface PatientModuleProps {
  scan: MedicalScan | null;
  diagnosis: AIDiagnosisResult | null;
  decision: DecisionSupport | null;
  patientInfo: PatientCommunication | null;
}

const PatientModule: React.FC<PatientModuleProps> = ({ scan, diagnosis, decision, patientInfo }) => {
  if (!patientInfo || !diagnosis || !decision) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-[#16191F] rounded-[48px] border border-white/5 mx-auto max-w-4xl">
      <MessageCircle className="w-16 h-16 mb-6 opacity-20 animate-pulse" />
      <p className="text-lg font-bold">Diagnostic summary not generated.</p>
      <p className="text-sm">Complete the clinical analysis first to generate patient-friendly insights.</p>
    </div>
  );

  const getTriageStyles = (level: string) => {
    switch (level) {
      case 'EMERGENCY': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 ring-rose-500/10';
      case 'PRIORITY': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 ring-amber-500/10';
      default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 ring-emerald-500/10';
    }
  };

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'High': return 'text-rose-500';
      case 'Medium': return 'text-amber-500';
      default: return 'text-emerald-500';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-16 rounded-[48px] text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
          <Heart className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="bg-white/10 w-fit px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border border-white/10">
            Health Narrative Summary
          </div>
          <h2 className="text-5xl font-black max-w-2xl leading-tight tracking-tight text-white">
            Understanding your <span className="text-blue-200">results</span> in plain language.
          </h2>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-sm">
            <p className="text-xl text-blue-50 font-medium leading-relaxed">
              {patientInfo.simpleExplanation}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-[20px] backdrop-blur-md border border-white/5">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-bold">HIPAA Secured</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-[20px] backdrop-blur-md border border-white/5">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span className="text-sm font-bold">ScanWise Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Clinical Status Bar (Triage & Risk) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[40px] border flex flex-col items-center text-center space-y-4 shadow-xl ring-4 ${getTriageStyles(decision.triagePriority)} transition-all duration-500`}>
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">AI Triage Classification</p>
            <h4 className="text-3xl font-black tracking-tighter">{decision.triagePriority}</h4>
          </div>
          <p className="text-xs font-medium opacity-80 px-6 leading-relaxed">
            This indicates the recommended clinical priority for your provider's review.
          </p>
        </div>

        <div className="p-8 bg-[#16191F] border border-white/5 rounded-[40px] flex flex-col items-center text-center space-y-4 shadow-xl transition-all duration-500">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Risk Level</p>
            <h4 className={`text-3xl font-black tracking-tighter ${getRiskStyles(diagnosis.riskLevel)}`}>
              {diagnosis.riskLevel} Risk
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-medium px-6 leading-relaxed">
            Based on the detected markers, this represents the calculated diagnostic severity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Requirement: What's Next Section */}
        <div className="bg-[#16191F] border border-white/5 p-12 rounded-[48px] space-y-8 shadow-2xl hover:ring-2 ring-amber-500/10 transition-all">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black tracking-tight text-white">What's Next?</h3>
            <p className="text-slate-400 leading-relaxed text-lg font-medium">
              Your results will be sent to your healthcare provider. They will talk with you about how these results relate to any symptoms you are feeling. No urgent surgery or immediate medical procedures are needed based on these findings.
            </p>
          </div>
          <button className="w-full py-5 bg-white text-slate-950 hover:bg-blue-50 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/5 active:scale-95 group">
            Schedule Follow-up <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-[#16191F] border border-white/5 p-12 rounded-[48px] space-y-8 flex flex-col justify-between shadow-2xl hover:ring-2 ring-blue-500/10 transition-all">
          <div className="space-y-8">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/5">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight text-white">Need Support?</h3>
              <p className="text-slate-400 leading-relaxed text-lg font-medium">
                Our clinical bridge team is available 24/7 to discuss these findings. Speak directly with Dr. Sarah Chen's specialized department.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black text-lg transition-all shadow-2xl shadow-blue-900/20 active:scale-95">
              Message Clinical Assistant
            </button>
            <div className="flex items-center justify-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Average response: 2 mins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[32px] flex items-start gap-6">
        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Clinical Disclaimer</p>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            ScanWise AI translations are designed to assist communication between patients and doctors. Always prioritize the formal medical opinion provided by your primary healthcare professional during your scheduled consult.
          </p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="text-center pt-12 border-t border-white/5">
        <p className="text-slate-600 text-xs font-bold flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
          <Users className="w-4 h-4" /> Finalized by ScanWise AI Communication Module v4.2
        </p>
      </div>
    </div>
  );
};

export default PatientModule;
