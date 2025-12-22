
import React from 'react';
import { MeetingReport } from '../types';

interface MeetingReportDisplayProps {
  report: MeetingReport;
  onReset: () => void;
}

export const MeetingReportDisplay: React.FC<MeetingReportDisplayProps> = ({ report, onReset }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-16 w-full max-w-4xl mx-auto">
      <div className="flex items-end justify-between border-b border-white/10 pb-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="status-active"></div>
            <span className="text-monospace text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase">Synthesis Finalized</span>
          </div>
          <h2 className="text-5xl font-extrabold tracking-tighter text-white">Record of Decision</h2>
        </div>
        <button 
          onClick={onReset}
          className="text-monospace text-[10px] font-bold text-slate-500 tracking-widest uppercase hover:text-white transition-colors"
        >
          [ New Entry ]
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-16">
          <section className="space-y-6">
            <h3 className="text-monospace text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase">Executive Context</h3>
            <p className="text-xl text-slate-300 leading-relaxed font-medium">
              {report.summary}
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-monospace text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase">Decisions</h3>
            <div className="space-y-4">
              {report.decisions.map((decision, i) => (
                <div key={i} className="flex items-start p-5 bg-white/[0.02] border border-white/5 rounded">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 mr-4 flex-shrink-0"></div>
                  <p className="text-slate-400 text-sm leading-relaxed">{decision}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-16">
          <section className="space-y-6">
            <h3 className="text-monospace text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase">Ownership</h3>
            <div className="space-y-4">
              {report.action_items.map((item, i) => (
                <div key={i} className="interface-card p-6 rounded border-l-4 border-l-blue-500">
                  <p className="text-white text-sm font-bold mb-4 leading-tight">{item.task}</p>
                  <div className="flex justify-between items-center text-monospace text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{item.owner}</span>
                    <span className="opacity-50">{item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-monospace text-[10px] font-bold text-slate-600 tracking-[0.4em] uppercase">Distribution</h3>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => copyToClipboard(report.whatsapp_followup)}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all"
              >
                <span>Brief Group</span>
                <span className="opacity-30">Copy</span>
              </button>
              <button 
                onClick={() => copyToClipboard(report.email_followup)}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all"
              >
                <span>Formal Update</span>
                <span className="opacity-30">Copy</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
