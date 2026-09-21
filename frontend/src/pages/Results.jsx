import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { analysisApi, trendsApi } from '../api/client';
import ScoreGauge from '../components/ScoreGauge';
import KeywordGapList from '../components/KeywordGapList';
import SkillGapTable from '../components/SkillGapTable';
import TrendSuggestions from '../components/TrendSuggestions';
import {
  Sparkles,
  ArrowLeft,
  FileText,
  Clock,
  Printer,
  ListChecks,
  FileCheck2,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';

const Results = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.result || null);
  const [roleTrend, setRoleTrend] = useState(null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      if (!result && id) {
        try {
          setLoading(true);
          const res = await analysisApi.getById(id);
          setResult(res.data.data);
        } catch (err) {
          setError(
            err.response?.data?.message || 'Failed to load analysis results.'
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResult();
  }, [id, result]);

  // Fetch full trend details for the target role
  useEffect(() => {
    const fetchTrendData = async () => {
      if (result?.targetRole) {
        try {
          const res = await trendsApi.getAll();
          const found = res.data.data?.find(
            (t) => t.roleName.toLowerCase() === result.targetRole.toLowerCase()
          );
          if (found) {
            setRoleTrend(found);
          }
        } catch (err) {
          console.warn('Could not fetch trend details for role:', err);
        }
      }
    };

    fetchTrendData();
  }, [result]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-semibold text-slate-600">
          Loading AI match report...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Report Not Found</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {error || 'Unable to display the requested analysis report.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analyzer</span>
        </Link>
      </div>
    );
  }

  const formattedDate = result.analyzedAt
    ? new Date(result.analyzedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Analysis</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS Match Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {result.targetRole || 'Software Engineer'} &bull; Match Analysis
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-700">
                {result.resumeFilename || 'Resume Document'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Top Section: Score Gauge & Key Missing Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ScoreGauge score={result.matchScore} />
          </div>

          <div className="md:col-span-2 flex flex-col justify-between">
            <KeywordGapList missingKeywords={result.missingKeywords || []} />
          </div>
        </div>
      </div>

      {/* Middle Section: Skill Gap Analysis */}
      <div className="mb-6">
        <SkillGapTable skillGaps={result.skillGaps || []} />
      </div>

      {/* Suggestions Section: Format & Actionable Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ATS Format Suggestions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                ATS Resume Format Suggestions
              </h3>
              <p className="text-xs text-slate-500">
                Structural & formatting tips for applicant tracking parsers
              </p>
            </div>
          </div>

          <ul className="space-y-3 pt-1">
            {result.formatSuggestions && result.formatSuggestions.length > 0 ? (
              result.formatSuggestions.map((sug, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100"
                >
                  <span className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))
            ) : (
              <p className="text-xs text-slate-400">Formatting appears well structured.</p>
            )}
          </ul>
        </div>

        {/* Actionable Improvement Suggestions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Actionable Optimization Steps
              </h3>
              <p className="text-xs text-slate-500">
                High-impact content tweaks to boost your interview chances
              </p>
            </div>
          </div>

          <ul className="space-y-3 pt-1">
            {result.improvementSuggestions && result.improvementSuggestions.length > 0 ? (
              result.improvementSuggestions.map((sug, i) => (
                <li
                  key={i}
                  className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{sug}</span>
                </li>
              ))
            ) : (
              <p className="text-xs text-slate-400">No specific improvements suggested.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Market Trend Context Card */}
      <div className="mb-6">
        <TrendSuggestions
          targetRole={result.targetRole}
          trendingSkills={
            roleTrend?.trendingSkills || result.roleTrendingSkills || []
          }
          trendingTools={roleTrend?.trendingTools || []}
          inDemandKeywords={roleTrend?.inDemandKeywords || []}
        />
      </div>
    </div>
  );
};

export default Results;
