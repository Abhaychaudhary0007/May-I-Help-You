import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi, trendsApi, jdApi } from '../api/client';
import FileUpload from '../components/FileUpload';
import { Sparkles, FileText, Briefcase, Wand2, AlertCircle, Loader2, BookOpen, Layers, FileSpreadsheet } from 'lucide-react';

const SAMPLE_JDS = {
  'Backend Developer': `Senior Backend Engineer (Java / Spring Boot)
Requirements:
- 4+ years of professional software development experience with Java (Java 17/21) and Spring Boot 3.
- Proven experience building high-throughput microservices and RESTful APIs.
- Hands-on experience with Docker, Kubernetes, and CI/CD pipelines.
- Proficiency in MongoDB and relational databases (PostgreSQL/MySQL).
- Experience with Apache Kafka or RabbitMQ event-driven systems.
- Familiarity with Redis caching and AWS / GCP cloud environments.
- Strong knowledge of unit testing (JUnit, Mockito) and system design principles.`,

  'Frontend Developer': `Senior Frontend Engineer (React / TypeScript)
Requirements:
- 4+ years building responsive, accessible web applications using React 18+ and TypeScript.
- Strong proficiency in modern CSS, Tailwind CSS, and component styling.
- Experience with Next.js, SSR/SSG, and State Management (Zustand / Redux Toolkit).
- Proficient in testing with Jest, React Testing Library, or Playwright.
- Deep understanding of Core Web Vitals, performance profiling, and browser optimizations.
- Experience collaborating with Figma design tokens and RESTful/GraphQL APIs.`,

  'DevOps Engineer': `Lead DevOps / Platform Engineer
Requirements:
- 5+ years implementing Kubernetes (EKS/GKE), Docker containerization, and Helm charts.
- Infrastructure as Code (IaC) using Terraform.
- CI/CD workflow automation via GitHub Actions and ArgoCD (GitOps).
- Cloud expertise in AWS or GCP with VPC networking, IAM security, and cost governance.
- Monitoring and observability setup using Prometheus, Grafana, and OpenTelemetry.
- Scripting proficiency in Bash, Python, or Go.`,
};

const Dashboard = () => {
  const [currentResume, setCurrentResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'

  const [currentJdFile, setCurrentJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdInputMode, setJdInputMode] = useState('upload'); // 'upload' | 'text'

  const [targetRole, setTargetRole] = useState('Backend Developer');
  const [rolesList, setRolesList] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await trendsApi.getAll();
        if (res.data.data) {
          setRolesList(res.data.data);
        }
      } catch (err) {
        console.warn('Could not fetch role trends on dashboard:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleResumeUploadSuccess = (uploadedData) => {
    setCurrentResume(uploadedData);
    if (uploadedData.extractedText) {
      setResumeText(uploadedData.extractedText);
    }
    setError('');
  };

  const handleClearResume = () => {
    setCurrentResume(null);
  };

  const handleJdUploadSuccess = (uploadedData) => {
    setCurrentJdFile(uploadedData);
    setJdText(uploadedData.extractedText || '');
    setError('');
  };

  const handleClearJdFile = () => {
    setCurrentJdFile(null);
    setJdText('');
  };

  const handleLoadSampleJd = (role) => {
    if (SAMPLE_JDS[role]) {
      setJdText(SAMPLE_JDS[role]);
      setTargetRole(role);
      setCurrentJdFile(null);
      setJdInputMode('text');
    } else {
      setJdText(SAMPLE_JDS['Backend Developer']);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    if (inputMode === 'upload' && !currentResume?.resumeId) {
      setError('Please upload your resume (PDF/DOCX/PPT/TXT) first.');
      return;
    }

    if (inputMode === 'text' && !resumeText.trim()) {
      setError('Please enter or paste your resume text.');
      return;
    }

    if (jdInputMode === 'upload' && !currentJdFile && !jdText.trim()) {
      setError('Please upload a Job Description document (PDF/PPT/DOCX/TXT).');
      return;
    }

    if (!jdText.trim()) {
      setError('Please provide the Job Description (JD) text or upload a document.');
      return;
    }

    try {
      setAnalyzing(true);
      const payload = {
        resumeId: inputMode === 'upload' ? currentResume.resumeId : null,
        resumeText: inputMode === 'text' ? resumeText : null,
        jdText: jdText.trim(),
        targetRole: targetRole,
      };

      const res = await analysisApi.analyze(payload);
      const analysisData = res.data.data;
      navigate(`/results/${analysisData.id}`, { state: { result: analysisData } });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Analysis failed. Please ensure all inputs are valid.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 2.0 AI ATS Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Score Your Resume vs Target JD
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Upload your resume and job description (PDF, Word, PowerPoint, TXT) to get instant ATS match scoring, keyword gap analysis, and current market recommendations.
        </p>
      </div>

      {error && (
        <div className="mb-6 max-w-4xl mx-auto flex items-center space-x-2 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleAnalyze} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column: Resume Input */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">1. Your Resume</h2>
                    <p className="text-xs text-slate-400">PDF, Word, PPT, or plain text</p>
                  </div>
                </div>

                {/* Input Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      inputMode === 'upload'
                        ? 'bg-white text-slate-800 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      inputMode === 'text'
                        ? 'bg-white text-slate-800 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {inputMode === 'upload' ? (
                <FileUpload
                  onUploadSuccess={handleResumeUploadSuccess}
                  currentFile={currentResume}
                  onClearFile={handleClearResume}
                  label="Resume Document"
                  title="Click to upload or drag & drop resume"
                  subtitle="Supports PDF, Word (DOCX/DOC), PowerPoint (PPT/PPTX), TXT"
                  accentColor="emerald"
                />
              ) : (
                <textarea
                  rows={9}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here (Skills, Experience, Education, Projects)..."
                  className="w-full p-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              )}
            </div>

            {/* Target Role Selector */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Target Role & Market Domain</span>
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 transition-all"
              >
                {rolesList.length > 0 ? (
                  rolesList.map((r) => (
                    <option key={r.id || r.roleName} value={r.roleName}>
                      {r.roleName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Cloud Architect">Cloud Architect</option>
                    <option value="Data Analyst / Engineer">Data Analyst / Engineer</option>
                    <option value="Machine Learning / AI Engineer">Machine Learning / AI Engineer</option>
                    <option value="Mobile App Developer">Mobile App Developer</option>
                    <option value="QA Automation Engineer">QA Automation Engineer</option>
                    <option value="Technical Product Manager">Technical Product Manager</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Right Column: Job Description Input */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">2. Job Description (JD)</h2>
                    <p className="text-xs text-slate-400">PDF, Word, PPT deck, or text</p>
                  </div>
                </div>

                {/* Input Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setJdInputMode('upload')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      jdInputMode === 'upload'
                        ? 'bg-white text-slate-800 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setJdInputMode('text')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      jdInputMode === 'text'
                        ? 'bg-white text-slate-800 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {jdInputMode === 'upload' ? (
                <div className="space-y-3">
                  <FileUpload
                    uploadFn={jdApi.uploadJdFile}
                    onUploadSuccess={handleJdUploadSuccess}
                    currentFile={currentJdFile}
                    onClearFile={handleClearJdFile}
                    label="Job Description Document"
                    title="Click to upload or drag & drop JD file"
                    subtitle="Supports PDF, Word (DOCX/DOC), PowerPoint (PPT/PPTX), TXT (Max 10MB)"
                    accentColor="teal"
                  />
                  {currentJdFile && (
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span>Extracted JD Content Preview</span>
                        <span>{jdText.length} characters</span>
                      </div>
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 line-clamp-4 leading-relaxed">
                        {jdText}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Sample JD Quick Loaders */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-slate-400">Quick load sample:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJd('Backend Developer')}
                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        Backend
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJd('Frontend Developer')}
                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        Frontend
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleJd('DevOps Engineer')}
                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        DevOps
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={9}
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here (responsibilities, required skills, tools, qualifications)..."
                    className="w-full p-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{jdText.length} characters loaded</span>
              {jdText.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setJdText('');
                    setCurrentJdFile(null);
                  }}
                  className="hover:text-rose-500 transition-colors"
                >
                  Clear JD
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA Analyze Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={analyzing}
            className="group relative inline-flex items-center justify-center space-x-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Analyzing Resume vs JD with Gemini AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>Run AI Match Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;
