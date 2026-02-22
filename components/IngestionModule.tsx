
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Info,
  Layers,
  Zap,
  Search,
  Database,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DiagnosticModality, MedicalScan } from '../types';
import { fetchEMRPatient } from '../services/emrService';
import { detectScanType } from '../services/geminiService';

interface IngestionModuleProps {
  onScanComplete: (scan: MedicalScan) => void;
  onLoadDemo: () => void;
}

const IngestionModule: React.FC<IngestionModuleProps> = ({ onScanComplete, onLoadDemo }) => {
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  
  const [modality, setModality] = useState<DiagnosticModality>(DiagnosticModality.XRAY);
  const [region, setRegion] = useState('Brain');
  const [patientId, setPatientId] = useState('');
  const [isFetchingEhr, setIsFetchingEhr] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const [ehrRecord, setEhrRecord] = useState<any>(null);
  
  const [step, setStep] = useState<'upload' | 'processing' | 'ready'>('upload');
  const [processingProgress, setProcessingProgress] = useState(0);

  const scanInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const handleScanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setScanFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const previewUrl = reader.result as string;
        setScanPreview(previewUrl);
        
        setIsAutoDetecting(true);
        try {
          const detection = await detectScanType(previewUrl);
          setModality(detection.modality);
          setRegion(detection.region);
          setHasAutoDetected(true);
        } catch (err) {
          console.error("Auto-detection failed", err);
        } finally {
          setIsAutoDetecting(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setReportFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setReportPreview(previewUrl);
        if (!scanPreview) {
          setModality(DiagnosticModality.LAB_REPORT);
          setRegion('Lab Tests');
          setHasAutoDetected(true);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleEhrFetch = async () => {
    if (!patientId) return;
    setIsFetchingEhr(true);
    const result = await fetchEMRPatient(patientId);
    if (result) setEhrRecord(result);
    setIsFetchingEhr(false);
  };

  const startIngestion = () => {
    setStep('processing');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setProcessingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStep('ready');
      }
    }, 40);
  };

  const finalizeIngestion = () => {
    const primaryImage = scanPreview || reportPreview;
    if (!primaryImage) return;

    onScanComplete({
      id: Math.random().toString(36).substr(2, 9),
      patientId: patientId || 'ANONYMOUS',
      modality,
      region,
      timestamp: new Date().toISOString(),
      imageUrl: primaryImage,
      reportUrl: reportPreview || undefined,
      status: 'analyzed'
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Step 01: Secure Ingestion
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Data Flow Ingest</h2>
          <p className="text-slate-500 font-medium">Upload medical imaging or lab reports for correlated analysis.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onLoadDemo}
            className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all hover:bg-blue-600/20"
          >
            <Sparkles className="w-4 h-4" /> Try Sample Scan
          </button>
          <div className="bg-[#16191F] border border-white/5 px-5 py-3 rounded-2xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-bold text-slate-300">PACS Gateway Active</span>
          </div>
        </div>
      </div>

      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div 
                onClick={() => scanInputRef.current?.click()}
                className={`group relative overflow-hidden border-2 border-dashed rounded-[32px] p-8 aspect-square flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  scanFile ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-blue-500/30 hover:bg-white/5'
                }`}
              >
                <input type="file" ref={scanInputRef} className="hidden" accept="image/*" onChange={handleScanChange} />
                {scanPreview ? (
                  <div className="w-full h-full flex flex-col relative">
                    <img src={scanPreview} alt="Scan" className="flex-1 w-full object-cover rounded-2xl shadow-2xl mb-4" />
                    <p className="text-xs font-bold text-blue-500 text-center uppercase tracking-widest">Medical Scan Ready</p>
                    {isAutoDetecting && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">AI Auto-Detecting Modality...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-600/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-xl mb-1 text-center">Upload Imaging</p>
                    <p className="text-slate-500 text-sm font-medium">DICOM, PNG, JPEG</p>
                  </>
                )}
              </div>

              <div 
                onClick={() => reportInputRef.current?.click()}
                className={`group relative overflow-hidden border-2 border-dashed rounded-[32px] p-8 aspect-square flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
                  reportFile ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 hover:border-purple-500/30 hover:bg-white/5'
                }`}
              >
                <input type="file" ref={reportInputRef} className="hidden" accept="image/*,.pdf,.txt" onChange={handleReportChange} />
                {reportPreview ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 w-full bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                       <FileText className="w-16 h-16 text-purple-500/40" />
                    </div>
                    <p className="text-xs font-bold text-purple-500 text-center uppercase tracking-widest">Lab Report Ingested</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-purple-600/10 text-purple-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <FileText className="w-10 h-10" />
                    </div>
                    <p className="font-bold text-xl mb-1 text-center">Add Lab Report</p>
                    <p className="text-slate-500 text-sm font-medium">Optional: Text or Image</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#16191F] border border-white/5 p-8 rounded-[32px] flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
                <Info className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                ScanWise uses <span className="text-white font-bold">End-to-End Encryption</span> for all clinical data. Our pre-processing module automatically anonymizes patient PII before AI analysis.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#16191F] border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-8">
              <h3 className="font-bold text-xl flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-500" /> Patient Registry
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">EHR Sync Identifier</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="e.g. PAT-8821"
                      className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none transition-all text-sm font-semibold"
                    />
                    <button onClick={handleEhrFetch} className="bg-white/5 hover:bg-white/10 px-4 rounded-2xl transition-all border border-white/5">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {ehrRecord && (
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mb-2">Authenticated Chart</p>
                    <p className="text-lg font-bold">{ehrRecord.name}</p>
                    <p className="text-xs text-slate-500 font-medium">DOB: {ehrRecord.dob} • Gender: {ehrRecord.gender}</p>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                      Modality
                      {hasAutoDetected && (
                        <span className="flex items-center gap-1 text-[8px] text-blue-400 font-black animate-in fade-in slide-in-from-right-2">
                          <Sparkles className="w-2.5 h-2.5" /> AI DETECTED
                        </span>
                      )}
                    </label>
                    <select 
                      value={modality}
                      onChange={(e) => setModality(e.target.value as DiagnosticModality)}
                      className={`w-full bg-slate-900 border rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none text-sm transition-all ${hasAutoDetected ? 'border-blue-500/30' : 'border-white/5'}`}
                    >
                      {Object.values(DiagnosticModality).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                      Primary Region / Test
                      {hasAutoDetected && (
                        <span className="flex items-center gap-1 text-[8px] text-blue-400 font-black animate-in fade-in slide-in-from-right-2">
                          <Sparkles className="w-2.5 h-2.5" /> AI DETECTED
                        </span>
                      )}
                    </label>
                    <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className={`w-full bg-slate-900 border rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none text-sm transition-all ${hasAutoDetected ? 'border-blue-500/30' : 'border-white/5'}`}
                    >
                      {['Brain', 'Spine', 'Chest', 'Lungs', 'Abdomen', 'Arms', 'Legs', 'Skin', 'Lab Tests'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                disabled={(!scanFile && !reportFile) || isAutoDetecting}
                onClick={startIngestion}
                className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 text-white rounded-[24px] font-bold text-lg transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3"
              >
                {isAutoDetecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Preparation <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="bg-[#16191F] border border-white/5 p-20 rounded-[48px] text-center space-y-12 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-white/5">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${processingProgress}%` }}></div>
          </div>
          <div className="relative inline-flex">
            <Loader2 className="w-32 h-32 text-blue-500 animate-[spin_2s_linear_infinite] opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20">
                {processingProgress}%
               </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-bold">Step 02: Clinical Data Prep</h3>
            <p className="text-slate-500 text-lg font-medium">Normalizing data for analysis engines...</p>
          </div>
        </div>
      )}

      {step === 'ready' && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-20 rounded-[48px] text-center space-y-8 max-w-3xl mx-auto animate-in zoom-in-95">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h3 className="text-4xl font-black text-emerald-400">Standardized Tensors Ready</h3>
            <p className="text-slate-400 text-lg">Visual or textual data optimized for Step 03: Analysis.</p>
          </div>
          <button 
            onClick={finalizeIngestion}
            className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-4 mx-auto"
          >
            Launch Case Analysis <Zap className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default IngestionModule;
