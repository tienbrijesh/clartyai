
import React, { useState, useEffect } from 'react';

interface ProcessingOverlayProps {
  currentStep?: string;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ currentStep }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 99) return 99;
        // Slow and steady for long-form synthesis
        const diff = Math.random() * 0.8;
        return Math.min(oldProgress + diff, 100);
      });
    }, 600);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto space-y-12 py-10">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-6 bg-blue-500/10 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <h2 className="text-monospace text-[11px] font-bold text-white tracking-[0.5em] uppercase">
            Pro Spectrum Synthesis
          </h2>
          <span className="text-[9px] text-blue-400 font-mono tracking-widest opacity-60">LONG_FORM_PIPELINE_v3.2</span>
        </div>
      </div>

      <div className="interface-card p-10 rounded-sm overflow-hidden relative shadow-2xl shadow-blue-500/5">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="relative space-y-8">
          <div className="flex justify-between items-end text-monospace text-[10px] font-bold tracking-[0.2em] uppercase">
            <span className="text-slate-500">Timeline Resolution</span>
            <span className="text-blue-500">{Math.round(progress)}% RESOLVED</span>
          </div>

          <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
             <div className="text-monospace text-[10px] text-white tracking-[0.2em] uppercase flex items-center min-h-[1.5rem]">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
              {currentStep || "INITIALIZING UPLINK..."}
            </div>
            <div className="text-[9px] text-slate-600 text-monospace tracking-widest uppercase flex items-center justify-between">
              <span>Path: spectrum_extraction_v3</span>
              <span className="opacity-40 font-mono">X-RES: PRO</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded text-[10px] text-blue-400/80 text-center font-mono tracking-widest leading-relaxed uppercase">
        Synthesis for a 2-hour recording can take up to 2 minutes. <br/>
        Please keep this window active.
      </div>
    </div>
  );
};
