
import React, { useState } from 'react';
import { 
  Link2, 
  ShieldCheck, 
  Activity, 
  FileJson, 
  History, 
  RefreshCcw, 
  ExternalLink,
  Lock,
  ArrowRightLeft,
  ChevronDown,
  Database,
  BrainCircuit,
  Save,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  CloudUpload,
  Clock,
  Settings2,
  Calendar,
  Zap,
  ArrowRight,
  Filter
} from 'lucide-react';
import { getEHRConnectionStatus } from '../services/emrService';

const AI_FIELDS = [
  { id: 'abnormalities', label: 'Detected Abnormalities', icon: Activity },
  { id: 'risk_level', label: 'Triage & Risk Level', icon: ShieldCheck },
  { id: 'observations', label: 'Radiology Observations', icon: FileJson },
  { id: 'findings', label: 'Granular Finding List', icon: BrainCircuit },
  { id: 'reasoning', label: 'Clinical AI Reasoning', icon: Lock },
];

const EMR_SECTIONS = [
  { value: 'problem_list', label: 'Problem List / Active Issues' },
  { value: 'assessment_plan', label: 'Assessment & Plan' },
  { value: 'imaging_results', label: 'Imaging & Diagnostics' },
  { value: 'history', label: 'Patient History' },
  { value: 'chief_complaint', label: 'Chief Complaint' },
  { value: 'vitals', label: 'Vital Signs / Clinical Data' },
];

interface TransformationRule {
  dateFormat: string;
  unitConversion: string;
  conditionalLogic: string;
}

const EHRIntegration: React.FC = () => {
  const ehr = getEHRConnectionStatus();
  const [mappings, setMappings] = useState<Record<string, string>>({
    abnormalities: 'problem_list',
    risk_level: 'imaging_results',
    observations: 'imaging_results',
    findings: 'imaging_results',
    reasoning: 'assessment_plan',
  });

  const [rules, setRules] = useState<Record<string, TransformationRule>>({
    abnormalities: { dateFormat: 'ISO-8601', unitConversion: 'None', conditionalLogic: 'Prefix [AI-DETECTED]' },
    risk_level: { dateFormat: 'Short', unitConversion: 'None', conditionalLogic: 'If HIGH, set Priority: URGENT' },
    observations: { dateFormat: 'None', unitConversion: 'None', conditionalLogic: 'Append "Verified by Gemini 3 Pro"' },
    findings: { dateFormat: 'None', unitConversion: 'Metric to Imperial', conditionalLogic: 'None' },
    reasoning: { dateFormat: 'None', unitConversion: 'None', conditionalLogic: 'None' },
  });

  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleMappingChange = (aiField: string, emrSection: string) => {
    setMappings(prev => ({ ...prev, [aiField]: emrSection }));
  };

  const handleRuleChange = (aiField: string, key: keyof TransformationRule, value: string) => {
    setRules(prev => ({
      ...prev,
      [aiField]: { ...prev[aiField], [key]: value }
    }));
  };

  const handleSaveMappings = () => {
    setSaving(true);
    setSyncStatus('syncing');
    
    // Simulating FHIR Sync with Transformation Engine
    setTimeout(() => {
      setSaving(false);
      const isSuccess = Math.random() > 0.1; // 90% success rate
      if (isSuccess) {
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setSyncStatus('error');
      }
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-2">
            <Link2 className="w-4 h-4" /> System Integration Layer
          </div>
          <h2 className="text-4xl font-black tracking-tight">EHR Bridge Gateway</h2>
          <p className="text-slate-500 font-medium">Refine bidirectional data mapping and granular transformation rules.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
             <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest shadow-xl transition-all duration-500 ${
              ehr.status === 'Connected' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5'
            }`}>
              {ehr.status === 'Connected' ? <Wifi className="w-4 h-4 animate-pulse" /> : <WifiOff className="w-4 h-4" />}
              {ehr.provider}: {ehr.status}
            </div>

            <div className="flex items-center gap-3 bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-2xl border border-blue-500/20 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/5">
              <ShieldCheck className="w-4 h-4" /> FHIR R4 API Linked
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus !== 'idle' && (
        <div className={`p-6 rounded-[32px] border flex items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 ${
          syncStatus === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
          syncStatus === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' :
          'bg-blue-500/5 border-blue-500/20 text-blue-400'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              syncStatus === 'success' ? 'bg-emerald-500/20' :
              syncStatus === 'error' ? 'bg-rose-500/20' :
              'bg-blue-500/20'
            }`}>
              {syncStatus === 'success' && <CheckCircle2 className="w-6 h-6" />}
              {syncStatus === 'error' && <AlertCircle className="w-6 h-6" />}
              {syncStatus === 'syncing' && <RefreshCcw className="w-6 h-6 animate-spin" />}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">
                {syncStatus === 'success' ? 'Synchronization Successful' :
                 syncStatus === 'error' ? 'Synchronization Failed' :
                 'Applying Transformation Logic...'}
              </p>
              <p className="text-xs opacity-70 font-medium">
                {syncStatus === 'success' ? `Custom formats applied and pushed to ${ehr.provider} at ${lastSyncTime}.` :
                 syncStatus === 'error' ? 'Transformation engine failed to parse a mapping rule. Check conditional logic syntax.' :
                 'Reformatting dates and converting units via HL7 middleware.'}
              </p>
            </div>
          </div>
          {syncStatus === 'success' && (
            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" /> {lastSyncTime}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-[#16191F] border border-white/5 rounded-[48px] overflow-hidden shadow-2xl ring-1 ring-white/5">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-blue-600/10 to-transparent">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <ArrowRightLeft className="w-7 h-7 text-blue-500" /> Transformation Engine
                </h3>
                <p className="text-slate-500 text-sm font-medium">Map AI findings and specify data reformatting rules.</p>
              </div>
              <button 
                onClick={handleSaveMappings}
                disabled={saving || ehr.status !== 'Connected'}
                className="bg-white text-slate-950 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                {saving ? 'Processing...' : 'Deploy Mappings'}
              </button>
            </div>

            <div className="p-10 space-y-6">
              {AI_FIELDS.map((field) => (
                <div key={field.id} className="bg-slate-900/50 rounded-[32px] border border-white/5 hover:border-blue-500/10 transition-all overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <field.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-100">{field.label}</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">AI Target Field</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:block text-slate-700">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                      <div className="relative min-w-[200px]">
                        <select 
                          value={mappings[field.id]}
                          onChange={(e) => handleMappingChange(field.id, e.target.value)}
                          className="w-full bg-[#16191F] border border-white/10 rounded-2xl px-5 py-3.5 text-xs font-bold appearance-none focus:border-blue-500 outline-none transition-all pr-10 cursor-pointer text-slate-300"
                        >
                          {EMR_SECTIONS.map((section) => (
                            <option key={section.value} value={section.value}>{section.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      </div>
                      
                      <button 
                        onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                          expandedField === field.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-white'
                        }`}
                      >
                        <Settings2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Advanced Configuration Panel */}
                  {expandedField === field.id && (
                    <div className="p-8 bg-slate-800/20 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" /> Date Format
                          </label>
                          <select 
                            value={rules[field.id].dateFormat}
                            onChange={(e) => handleRuleChange(field.id, 'dateFormat', e.target.value)}
                            className="w-full bg-[#16191F] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 focus:border-blue-500 outline-none"
                          >
                            <option value="None">Original String</option>
                            <option value="ISO-8601">ISO-8601 (YYYY-MM-DD)</option>
                            <option value="Short">Short (MM/DD/YY)</option>
                            <option value="Human">Human (Jan 1, 2025)</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Unit Conversion
                          </label>
                          <select 
                            value={rules[field.id].unitConversion}
                            onChange={(e) => handleRuleChange(field.id, 'unitConversion', e.target.value)}
                            className="w-full bg-[#16191F] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 focus:border-blue-500 outline-none"
                          >
                            <option value="None">No Conversion</option>
                            <option value="Metric to Imperial">Metric → Imperial</option>
                            <option value="Imperial to Metric">Imperial → Metric</option>
                            <option value="Normalize">Normalize (0.0 to 1.0)</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Zap className="w-3.5 h-3.5" /> Logic / Prefix
                          </label>
                          <input 
                            type="text"
                            value={rules[field.id].conditionalLogic}
                            onChange={(e) => handleRuleChange(field.id, 'conditionalLogic', e.target.value)}
                            placeholder="e.g. If value > 10, mark URGENT"
                            className="w-full bg-[#16191F] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 focus:border-blue-500 outline-none placeholder:text-slate-700"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                        <Filter className="w-4 h-4 text-blue-400" />
                        <p className="text-[10px] text-blue-400/80 font-medium">
                          Active Transformation: <span className="font-bold">"{rules[field.id].conditionalLogic}"</span> with <span className="font-bold">"{rules[field.id].dateFormat}"</span> formatting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-900/50 border-t border-white/5 flex gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Rules are applied sequentially via the <span className="text-white font-bold">ScanWise HL7 Engine</span>. All transformations are idempotent and logged in the system ledger for auditing.
              </p>
            </div>
          </div>

          <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <History className="w-7 h-7 text-blue-500" /> Integration Ledger
              </h3>
            </div>
            <div className="space-y-6">
              {[
                { type: 'TRANSFORM', id: 'RULE-9921', msg: 'Date reformatted to ISO-8601 for PAT-8821 abnormality entry.', time: '1m ago', color: 'blue' },
                { type: 'PUSH', id: 'PAT-8821', msg: 'AI Findings (Chest X-Ray) successfully written to Imaging Results.', time: '2 mins ago', color: 'blue' },
                { type: 'PULL', id: 'PAT-4102', msg: 'Fetched demographics and clinical history for scan pre-population.', time: '14 mins ago', color: 'emerald' },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-6 p-6 hover:bg-slate-800/40 rounded-[32px] transition-all border border-transparent hover:border-white/5 group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    log.type === 'PUSH' ? 'bg-blue-500/10 text-blue-500' : 
                    log.type === 'TRANSFORM' ? 'bg-purple-500/10 text-purple-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-[10px] font-black tracking-widest uppercase ${
                        log.type === 'PUSH' ? 'text-blue-500' : 
                        log.type === 'TRANSFORM' ? 'text-purple-500' : 'text-emerald-500'
                      }`}>
                        {log.type} SUCCESS
                      </p>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{log.time}</span>
                    </div>
                    <p className="text-base font-bold text-slate-200">{log.msg}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <p className="text-xs text-slate-500 font-medium">Ref: <span className="font-mono text-slate-400">{log.id}</span></p>
                       <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                       <p className="text-xs text-slate-500 font-medium">System: <span className="text-blue-500/80">Transformation Node A</span></p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] space-y-10 shadow-2xl">
            <h3 className="text-xl font-bold">Transformation Context</h3>
            <div className="space-y-6">
               <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Unit Standards</p>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                  <p className="text-sm font-black text-slate-100 tracking-tight">SI Units / Metric Primary</p>
                </div>
              </div>
              <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Date Consistency</p>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                  <p className="text-sm font-black text-slate-100 tracking-tight">UTC-Normalized Timestamps</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] text-white space-y-6 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <Settings2 className="w-24 h-24" />
              </div>
              <h3 className="font-black text-2xl relative z-10 leading-tight">Advanced Logic Engine</h3>
              <p className="text-blue-100 text-sm leading-relaxed relative z-10 font-medium">
                Our middleware supports complex regex and conditional transformations to ensure AI outputs match your specific hospital system requirements.
              </p>
              <button className="relative z-10 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                View Logic Docs
              </button>
            </div>
          </div>
          
          <div className="p-8 border border-white/5 rounded-[40px] bg-slate-900/30 flex flex-col items-center text-center space-y-4">
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Epic_Systems_logo.svg/1200px-Epic_Systems_logo.svg.png" className="h-8 grayscale opacity-40 brightness-200" alt="Epic" />
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">Official Interconnect Partner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EHRIntegration;
