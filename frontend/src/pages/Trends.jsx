import React, { useEffect, useState } from 'react';
import { trendsApi } from '../api/client';
import {
  TrendingUp,
  RefreshCw,
  Sparkles,
  Wrench,
  Hash,
  Layers,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const Trends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await trendsApi.getAll();
      setTrends(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        setSelectedRole(res.data.data[0]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch role trends data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleRefreshTrends = async () => {
    try {
      setRefreshing(true);
      setStatusMessage('');
      setError('');
      const res = await trendsApi.refresh();
      setTrends(res.data.data || []);
      if (res.data.data && res.data.data.length > 0) {
        // preserve or set selected role
        const currentName = selectedRole?.roleName;
        const matched = res.data.data.find((t) => t.roleName === currentName);
        setSelectedRole(matched || res.data.data[0]);
      }
      setStatusMessage('Market trends successfully updated via Gemini AI!');
      setTimeout(() => setStatusMessage(''), 5000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to refresh trends via Gemini API.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading industry trends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header & Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tech Industry Market Trends
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Live AI-extracted hiring competencies, framework popularity, and ATS keyword weights per job role
          </p>
        </div>

        <button
          onClick={handleRefreshTrends}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing with Gemini...' : 'Refresh Trends (AI)'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 flex items-center space-x-2 p-3.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center space-x-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Roles Navigation List */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Select Job Domain ({trends.length})
          </h3>
          <div className="space-y-1 mt-1">
            {trends.map((item) => {
              const isSelected = selectedRole?.roleName === item.roleName;
              return (
                <button
                  key={item.id || item.roleName}
                  onClick={() => setSelectedRole(item)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{item.roleName}</span>
                  {isSelected && <Sparkles className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Trend Breakdown for Selected Role */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRole ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedRole.roleName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRole.description || 'Current industry hiring priorities and keyword benchmarks.'}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">
                  Last refreshed: {selectedRole.lastUpdated ? new Date(selectedRole.lastUpdated).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              {/* In-Demand Skills */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Top In-Demand Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.trendingSkills && selectedRole.trendingSkills.length > 0 ? (
                    selectedRole.trendingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Trending Tools & Frameworks */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <Wrench className="w-4 h-4 text-cyan-600" />
                  <span>Tools, Libraries & Frameworks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.trendingTools && selectedRole.trendingTools.length > 0 ? (
                    selectedRole.trendingTools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/70 shadow-2xs"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No tools listed</p>
                  )}
                </div>
              </div>

              {/* High-Frequency ATS Keywords */}
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  <Hash className="w-4 h-4 text-amber-600" />
                  <span>Key Resume & JD Keywords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.inDemandKeywords && selectedRole.inDemandKeywords.length > 0 ? (
                    selectedRole.inDemandKeywords.map((k, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs"
                      >
                        {k}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No keywords listed</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              Select a role from the left to view market trends.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trends;
