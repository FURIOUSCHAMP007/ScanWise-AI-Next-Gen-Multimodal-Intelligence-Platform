
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Activity, 
  MessageSquare, 
  Volume2, 
  VolumeX,
  BrainCircuit,
  Loader2,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface LiveAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ isOpen, onClose, context }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Implementation of base64/pcm decoding as per documentation
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setIsThinking(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const inputAudioContext = new AudioContext({ sampleRate: 16000 });
    const outputAudioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;
    outputNodeRef.current = outputAudioContext.createGain();
    outputNodeRef.current.connect(outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          setIsThinking(false);
          const source = inputAudioContext.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => [...prev.slice(-10), `Agent: ${message.serverContent?.outputTranscription?.text}`]);
          }
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            const ctx = audioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNodeRef.current!);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: () => setIsActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are a world-class radiologist assisting a clinician. Context: ${context}. Keep answers technical, concise, and professional.`,
      },
    });

    sessionRef.current = await sessionPromise;
  };

  useEffect(() => {
    if (isOpen && !isActive) startSession();
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-[#16191F]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-[100] animate-in slide-in-from-right duration-500 flex flex-col">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Peer-Review</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {isActive ? 'Live Interaction' : 'Initializing...'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto space-y-4">
        {transcription.length === 0 && !isThinking && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Mic className="w-12 h-12 text-slate-500" />
            <p className="text-sm font-medium">I'm listening. Ask me about the scan findings or specific biomarkers.</p>
          </div>
        )}
        {isThinking && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        {transcription.map((t, i) => (
          <div key={i} className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
            t.startsWith('Agent:') ? 'bg-blue-600/10 text-blue-200 border border-blue-500/10' : 'bg-slate-800 text-slate-400'
          }`}>
            {t}
          </div>
        ))}
      </div>

      <div className="p-8 border-t border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 h-8 items-end">
            {isActive && [1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="w-1 bg-blue-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <Volume2 className="w-5 h-5 text-slate-400" />
            </button>
            <button className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isActive ? 'bg-rose-500 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/20'
            }`}>
              {isActive ? <Mic className="w-6 h-6 text-white" /> : <Loader2 className="w-6 h-6 text-white animate-spin" />}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center font-black text-slate-600 uppercase tracking-widest">
          End-to-end encrypted audio stream
        </p>
      </div>
    </div>
  );
};

export default LiveAssistant;
