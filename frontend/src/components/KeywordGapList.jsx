import React, { useState } from 'react';
import { Tag, Copy, Check, Search, AlertCircle } from 'lucide-react';

const KeywordGapList = ({ missingKeywords = [] }) => {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = missingKeywords.filter((k) =>
    k.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopyAll = () => {
    if (missingKeywords.length === 0) return;
    navigator.clipboard.writeText(missingKeywords.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Missing Keywords ({missingKeywords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Keywords present in the job description but absent in your resume
            </p>
          </div>
        </div>

        {missingKeywords.length > 0 && (
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy List</span>
              </>
            )}
          </button>
        )}
      </div>

      {missingKeywords.length > 5 && (
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search missing keywords..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      )}

      {missingKeywords.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <p className="font-medium text-slate-700">No Missing Keywords!</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Your resume covers all primary keywords found in this job description.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
          {filtered.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/70 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-amber-500 mr-1.5" />
              {keyword}
            </span>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 py-2">No matching keywords found for &quot;{filter}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordGapList;
