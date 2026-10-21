import React from "react";
import { Building2, Cpu, Zap, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

export function RealWorldCaseStudies({ applications = [], title = "Algorithm" }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs">
        No production case studies mapped for this track.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> Production Engineering Deep-Dive
          </div>
          <h3 className="text-2xl font-black text-white mt-2">
            Where is {title} Used in the Real World?
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Algorithms are not just whiteboard questions. Discover how top engineering teams leverage this exact pattern to scale production systems to hundreds of millions of users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            Verified Production Patterns
          </span>
        </div>
      </div>

      {/* Case Study Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app, idx) => (
          <div
            key={idx}
            className="group bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header: Company & Industry Tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-base">
                    🏢
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {app.company_or_system}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Production Architecture
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>

              {/* Context Body */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                <strong className="text-blue-400 block mb-1">Architecture Context:</strong>
                {app.architecture_context}
              </div>
            </div>

            {/* Performance Metric Gain */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Impact:</strong> {app.performance_gain}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default RealWorldCaseStudies;
