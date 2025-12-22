
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 px-10 h-24 flex items-center justify-between bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center space-x-4 cursor-pointer group">
        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full"></div>
        </div>
        <span className="text-monospace font-extrabold text-sm tracking-[0.4em] uppercase text-white transition-colors duration-300 group-hover:text-blue-400">
          ClarityAI
        </span>
      </div>
      
      <div className="flex items-center space-x-12">
        <button className="hidden md:block relative group text-monospace font-bold text-[10px] tracking-[0.3em] uppercase text-slate-500 hover:text-white transition-colors duration-300">
          Security
          <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-blue-500/80 transition-all duration-300 ease-out group-hover:w-full"></span>
        </button>
        <button className="px-6 py-2.5 border border-white/10 text-white text-monospace text-[10px] font-bold tracking-[0.3em] uppercase rounded-sm relative overflow-hidden transition-all duration-500 hover:border-white/30 bg-transparent hover:bg-white/[0.06] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] active:scale-[0.98]">
          Request Access
        </button>
      </div>
    </header>
  );
};
