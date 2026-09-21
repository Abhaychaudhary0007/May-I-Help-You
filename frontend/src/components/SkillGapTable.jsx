import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, AlertTriangle, Search } from 'lucide-react';

const SkillGapTable = ({ skillGaps = [] }) => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const counts = {
    ALL: skillGaps.length,
    present: skillGaps.filter((s) => s.status?.toLowerCase() === 'present').length,
    partial: skillGaps.filter((s) => s.status?.toLowerCase() === 'partial').length,
    missing: skillGaps.filter((s) => s.status?.toLowerCase() === 'missing').length,
  };

  const filtered = skillGaps.filter((item) => {
    const matchesTab =
      activeTab === 'ALL' || item.status?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = item.skill?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'present') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          Present
        </span>
      );
    } else if (st === 'partial') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Partial
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
          Missing
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Skill Gap Analysis</h3>
            <p className="text-xs text-slate-500">
              Required job competencies matched against your resume
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            onClick={() => setActiveTab('present')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'present'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            Present ({counts.present})
          </button>
          <button
            onClick={() => setActiveTab('partial')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'partial'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-amber-700 hover:text-amber-800'
            }`}
          >
            Partial ({counts.partial})
          </button>
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeTab === 'missing'
                ? 'bg-rose-600 text-white shadow-sm font-semibold'
                : 'text-rose-700 hover:text-rose-800'
            }`}
          >
            Missing ({counts.missing})
          </button>
        </div>
      </div>

      {/* Search Input */}
      {skillGaps.length > 6 && (
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      )}

      {/* Skills Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5">Competency / Skill</th>
              <th className="px-4 py-2.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800 text-xs sm:text-sm">
                    {item.skill}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-4 py-6 text-center text-xs text-slate-400">
                  No skills found matching this criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkillGapTable;
