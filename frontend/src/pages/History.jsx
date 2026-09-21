import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi } from '../api/client';
import { History as HistoryIcon, ArrowRight, FileText, Calendar, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await analysisApi.getHistory();
        setHistory(res.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load past analyses.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getScoreBadge = (score) => {
    let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score < 50) {
      color = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (score < 75) {
      color = 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
        {score}% Match
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">Loading analysis history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Analysis History
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review your previous resume ATS evaluations and tracked improvements
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center space-x-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Past Analyses Yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            Upload your resume and test it against a job description to generate your first match report.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start First Analysis</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const dateStr = item.analyzedAt
              ? new Date(item.analyzedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown date';

            return (
              <Link
                key={item.id}
                to={`/results/${item.id}`}
                className="group block bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-sm transition-all hover:shadow-md hover:border-emerald-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 rounded-xl transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {item.targetRole || 'Software Engineer'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-600">
                          {item.resumeFilename || 'Uploaded Resume'}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="flex items-center space-x-3">
                      {getScoreBadge(item.matchScore)}
                      <span className="text-xs text-slate-500 hidden md:inline">
                        {item.missingKeywordsCount} missing keywords
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
