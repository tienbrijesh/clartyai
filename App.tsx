
import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { MeetingReportDisplay } from './components/MeetingReport';
import { processMeetingVideo } from './services/gemini';
import { AppState, MeetingReport } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [report, setReport] = useState<MeetingReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    try {
      setState('PROCESSING');
      setError(null);
      const result = await processMeetingVideo(file, (step) => setCurrentStep(step));
      if (result) {
        setReport(result);
        setState('RESULT');
      } else {
        throw new Error("ENGINE_EMPTY: Synthesis failed to resolve any decisions.");
      }
    } catch (err: any) {
      console.error("App Error:", err);
      setError(err.message || "SYNTHESIS_FAILED: High-volume processing error.");
      setState('ERROR');
    }
  };

  const handleReset = () => {
    setState('IDLE');
    setReport(null);
    setError(null);
    setCurrentStep('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-blue-500/20 bg-[#020617]">
      <Header />

      <main className="w-full max-w-6xl px-8 pt-44 pb-32 flex flex-col items-center flex-grow">
        
        {state === 'IDLE' && (
          <div className="w-full flex flex-col items-center space-y-24 animate-enter">
            <div className="text-center space-y-10 max-w-4xl">
              <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-monospace text-[9px] font-bold text-blue-400 tracking-[0.3em] uppercase">V3 Pro Engine Active</span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-extrabold text-white letter-tight tracking-tighter leading-[0.85]">
                Resolved <br/><span className="text-blue-500 opacity-90">in seconds.</span>
              </h1>
              
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                ClarityAI's new long-form pipeline resolves meetings up to 4 hours in length. 
                Full acoustic synthesis. Visual context sampling. Definitive outcomes.
              </p>
            </div>

            <div className="w-full max-w-3xl relative group">
              <div className="absolute -inset-4 border border-white/5 rounded-lg -z-10 group-hover:border-white/10 transition-colors"></div>
              <UploadZone onUpload={handleFileUpload} />
              <div className="absolute -bottom-16 left-0 w-full flex justify-between px-2 text-monospace text-[9px] font-bold text-slate-600 tracking-[0.4em] uppercase">
                <span>Pipeline: Pro Spectrum</span>
                <span>Capacity: 4.0 HRS / SESSION</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full pt-12 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
               <div className="space-y-4">
                  <div className="text-monospace text-[10px] font-bold text-white tracking-widest uppercase">Spectrum Extraction</div>
                  <p className="text-xs leading-relaxed">Extracts verbal data from any video container.</p>
               </div>
               <div className="space-y-4">
                  <div className="text-monospace text-[10px] font-bold text-white tracking-widest uppercase">Visual Grounding</div>
                  <p className="text-xs leading-relaxed">Automatic timeline sampling for slide analysis.</p>
               </div>
               <div className="space-y-4">
                  <div className="text-monospace text-[10px] font-bold text-white tracking-widest uppercase">Global Distribution</div>
                  <p className="text-xs leading-relaxed">Clean follow-ups for your global stakeholders.</p>
               </div>
            </div>
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className="w-full py-12 animate-enter">
            <ProcessingOverlay currentStep={currentStep} />
          </div>
        )}

        {state === 'RESULT' && report && (
          <div className="w-full animate-enter">
            <MeetingReportDisplay report={report} onReset={handleReset} />
          </div>
        )}

        {state === 'ERROR' && (
          <div className="w-full max-w-lg mx-auto py-20 animate-enter">
            <div className="interface-card p-10 md:p-16 rounded-sm text-center space-y-10 border-red-500/20 bg-red-500/[0.02]">
              <div className="space-y-6">
                <div className="w-12 h-12 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-red-500 font-bold text-monospace text-[11px] tracking-[0.4em] uppercase">Resolution Error</h3>
                  <p className="text-slate-300 text-sm font-medium leading-relaxed font-mono opacity-80">{error}</p>
                </div>
              </div>
              
              <button 
                onClick={handleReset} 
                className="w-full py-5 bg-white/5 border border-white/10 text-white font-bold text-[10px] tracking-[0.3em] uppercase rounded-sm hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
              >
                Reset Engine Parameters
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-white/5 py-16 bg-black/20 mt-auto">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 opacity-30">
          <div className="flex items-center space-x-3 text-monospace text-[10px] font-bold tracking-[0.3em] uppercase">
            <span>Enterprise-Grade Security</span>
            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
            <span>Local Buffer Extraction</span>
          </div>
          <div className="text-[9px] text-monospace tracking-widest">
            CLARITY_PRO_V3 // BUILD_4021
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
