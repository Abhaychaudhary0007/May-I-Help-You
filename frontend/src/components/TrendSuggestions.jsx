import React from 'react';
import { TrendingUp, Wrench, Hash, Sparkles } from 'lucide-react';

const TrendSuggestions = ({ targetRole, trendingSkills = [], trendingTools = [], inDemandKeywords = [] }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center space-x-2.5 mb-4">
        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">
              Market Trend Context: {targetRole || 'Software Engineer'}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5 mr-1" /> Live AI Market Data
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Skills and tools prioritized by hiring teams for this specific role in 2025/2026
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* In-Demand Skills */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top In-Demand Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingSkills.length > 0 ? (
              trendingSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-700/80 text-slate-200 rounded-md border border-slate-600/50"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Loading skills...</span>
            )}
          </div>
        </div>

        {/* Trending Tools */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Trending Tools & Tech</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTools.length > 0 ? (
              trendingTools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-700/80 text-slate-200 rounded-md border border-slate-600/50"
                >
                  {tool}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Loading tools...</span>
            )}
          </div>
        </div>

        {/* ATS Keywords */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Hash className="w-3.5 h-3.5" />
            <span>High-Frequency Keywords</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inDemandKeywords.length > 0 ? (
              inDemandKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-700/80 text-slate-200 rounded-md border border-slate-600/50"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Loading keywords...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendSuggestions;
