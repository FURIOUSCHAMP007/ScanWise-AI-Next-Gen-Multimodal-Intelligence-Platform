import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Activity,
  Zap,
  LayoutDashboard,
  Sparkles,
  MapPin,
  ExternalLink,
  ShieldCheck,
  BrainCircuit,
  PieChart,
  Loader2,
  Navigation,
  Globe,
  AlertTriangle,
  History,
  ActivitySquare
} from 'lucide-react';
import { AppView, MedicalScan, AIDiagnosisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { getDashboardBriefing, getRegionalTraumaMap } from '../services/geminiService';

const chartData = [
  { name: '08:00', load: 12 },
  { name: '10:00', load: 18 },
  { name: '12:00', load: 25 },
  { name: '14:00', load: 22 },
  { name: '16:00', load: 30 },
  { name: '18:00', load: 20 },
];

const modalityData = [
  { name: 'MRI', value: 45, color: '#3b82f6' },
  { name: 'CT', value: 30, color: '#6366f1' },
  { name: 'X-Ray', value: 25, color: '#0ea5e9' },
];

interface DashboardProps {
  onSelectView: (view: AppView) => void;
  activeScan: MedicalScan | null;
  diagnosis: AIDiagnosisResult | null;
  onLoadDemo: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectView, activeScan, diagnosis, onLoadDemo }) => {
  const [briefing, setBriefing] = useState<string>("Initializing clinical state summary...");
  const [traumaMap, setTraumaMap] = useState<{ text: string; links: { title: string; uri: string }[] } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [isBriefingLoaded, setIsBriefingLoaded] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const b = await getDashboardBriefing({ emergency: 3, queue: 24, latency: '4.2s', shift: 'Morning' });
        setBriefing(b);
        setIsBriefingLoaded(true);
      } catch (e) {
        console.error("Briefing error", e);
      }
    };

    const fetchMap = async () => {
      setLoadingMap(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const m = await getRegionalTraumaMap(pos.coords.latitude, pos.coords.longitude);
            setTraumaMap(m);
          } catch (e) {
            console.error("Map grounding error", e);
          } finally {
            setLoadingMap(false);
          }
        }, () => setLoadingMap(false));
      } else {
        setLoadingMap(false);
      }
    };

    fetchBriefing();
    fetchMap();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-2">
              <LayoutDashboard className="w-4 h-4" /> Operational Command Center
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-2">System Status</h1>
            <p className="text-slate-500 text-lg font-medium">Predictive triage workload and regional medical logistics.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onLoadDemo}
              className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-8 py-4 rounded-[24px] font-black text-sm flex items-center gap-3 transition-all hover:bg-blue-600/20 active:scale-95"
            >
              <Sparkles className="w-5 h-5" /> Run Simulation
            </button>
            <button 
              onClick={() => onSelectView('ingestion')}
              className="bg-white text-slate-950 hover:bg-blue-50 px-8 py-4 rounded-[24px] font-black text-sm flex items-center gap-3 transition-all shadow-2xl shadow-white/5 active:scale-95"
            >
              <Plus className="w-5 h-5" /> New Analysis
            </button>
          </div>
        </div>

        <div className="bg-[#16191F] border border-blue-500/20 p-10 rounded-[40px] shadow-2xl relative overflow-hidden group border-l-[8px]">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <Sparkles className="w-32 h-32 text-blue-500" />
          </div>
          <div className="flex items-start gap-8 relative z-10">
            <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 shrink-0 shadow-lg border border-blue-500/20">
              <ActivitySquare className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">AI Dynamic Command Briefing</p>
                <div className="h-px flex-1 bg-blue-500/10"></div>
                {!isBriefingLoaded && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
              </div>
              <p className="text-2xl font-bold text-slate-100 leading-tight tracking-tight">
                {isBriefingLoaded ? briefing : "Analyzing current queue dynamics and throughput velocity..."}
              </p>
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1 bg-slate-800 rounded-lg">Last Updated: Just Now</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase px-3 py-1 bg-emerald-500/10 rounded-lg">Confidence: 98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Total Queue', value: '24', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
              { label: 'Active Emergencies', value: '3', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'High Risk' },
              { label: 'Avg Latency', value: '4.2s', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-0.5s' },
              { label: 'AI Sensitivity', value: '94.2%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Optimal' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#16191F] border border-white/5 p-10 rounded-[40px] shadow-xl hover:bg-slate-800/50 transition-all group cursor-default">
                <div className="flex items-center justify-between mb-8">
                  <div className={`${stat.bg} ${stat.color} p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <span className={`text-[10px] font-black flex items-center gap-1 px-3 py-1.5 rounded-full uppercase tracking-widest ${
                    stat.trend.includes('+') || stat.trend.includes('Risk') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {stat.trend} <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <p className="text-5xl font-black tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#16191F] border border-white/5 p-12 rounded-[48px] shadow-2xl">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-blue-500" /> Workload Forecast
                </h3>
                <p className="text-slate-500 text-sm font-medium">Predicting arrival density across regional hospitals.</p>
              </div>
              <div className="flex gap-2">
                {['24H', '48H', '7D'].map(t => (
                  <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${t === '48H' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-500 border-white/5 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Navigation className="w-6 h-6 text-blue-500" /> Network Map
              </h3>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            </div>
            
            <div className="bg-slate-900 aspect-video rounded-3xl border border-white/5 flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i656!3i1582!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2')] opacity-20 grayscale group-hover:scale-110 transition-transform duration-1000"></div>
              
              {loadingMap ? (
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grounding Medical Hubs...</p>
                </div>
              ) : traumaMap ? (
                <div className="relative z-10 w-full space-y-6 text-left">
                  <div className="space-y-3">
                    {traumaMap.links.slice(0, 3).map((link, i) => (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-700 transition-all group/link"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-bold text-slate-100 truncate max-w-[150px]">{link.title}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover/link:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-4">
                  <Globe className="w-12 h-12 text-slate-800 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 px-6">Location required to map regional medical nodes.</p>
                  <button className="bg-blue-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase">Enable Mapping</button>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                <span className="text-blue-500 font-bold uppercase tracking-widest block mb-1">Regional Insight</span>
                Found {traumaMap?.links.length || 0} Level 1 Trauma Centers within range with active recovery capacity.
              </p>
            </div>
          </div>

          <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <PieChart className="w-6 h-6 text-blue-500" /> Modality Mix
            </h3>
            
            <div className="h-[240px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {modalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black">24</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {modalityData.map(m => (
                <div key={m.name} className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 rounded-2xl border border-white/5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></div>
                  <span className="text-[10px] font-black text-slate-100">{m.name}</span>
                  <span className="text-xs font-bold text-slate-500">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-blue-500/20 p-10 rounded-[48px] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" /> AI Confidence
              </h3>
              <span className="text-xl font-black text-blue-400">96.8%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: '96.8%' }}></div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Confidence is aggregate across active nodes. High sensitivity maintained for neurological anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;