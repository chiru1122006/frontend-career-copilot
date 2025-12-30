import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Brain,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Briefcase,
  Check,
  Clock,
  Plus,
  FileText,
  User,
  Building2,
  Mail,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  ListTodo,
  GraduationCap,
  Wrench
} from 'lucide-react'
import { feedbackApi } from '../services/api'
import type { FeedbackAnalysis, FeedbackAnalysisRequest, LearningPriority } from '../types'
import { Skeleton } from '../components'

// Source options for feedback
const FEEDBACK_SOURCES = [
  { value: 'rejection_email', label: 'Rejection Email', icon: Mail, description: 'Got a rejection email from a company' },
  { value: 'interview_feedback', label: 'Interview Feedback', icon: MessageCircle, description: 'Feedback from an interview process' },
  { value: 'self_reflection', label: 'Self Reflection', icon: User, description: 'Your own thoughts on what went wrong' },
  { value: 'mentor_feedback', label: 'Mentor Feedback', icon: GraduationCap, description: 'Feedback from a mentor or coach' }
] as const

// Confidence level colors
const getConfidenceColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'low':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

// Readiness score color
const getReadinessColor = (score: number) => {
  if (score >= 70) return 'text-emerald-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-600'
}

const getReadinessBg = (score: number) => {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

// Priority status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700'
    case 'in_progress':
      return 'bg-blue-100 text-blue-700'
    case 'pending':
      return 'bg-gray-100 text-gray-600'
    case 'skipped':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export default function FeedbackPage() {
  // State for form
  const [source, setSource] = useState<FeedbackAnalysisRequest['source']>('rejection_email')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')
  const [interviewType, setInterviewType] = useState('')
  const [stage, setStage] = useState('')

  // State for UI
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(true)
  const [activeTab, setActiveTab] = useState<'analyze' | 'history' | 'priorities'>('analyze')
  const [error, setError] = useState<string | null>(null)

  // State for data
  const [currentAnalysis, setCurrentAnalysis] = useState<FeedbackAnalysis | null>(null)
  const [analyses, setAnalyses] = useState<FeedbackAnalysis[]>([])
  const [priorities, setPriorities] = useState<LearningPriority[]>([])
  const [stats, setStats] = useState<{
    total: number
    rejections: number
    interviews: number
    positive: number
    negative: number
  } | null>(null)

  // State for expanded sections in analysis
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    reasons: true,
    gaps: true,
    actions: true,
    learning: false,
    projects: false,
    resume: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [analysesRes, prioritiesRes, statsRes] = await Promise.all([
        feedbackApi.getAllAnalyses(20),
        feedbackApi.getLearningPriorities(),
        feedbackApi.getStats()
      ])
      setAnalyses(analysesRes.analyses || [])
      setPriorities(prioritiesRes.priorities || [])
      setStats(statsRes)
    } catch (error) {
      console.error('Failed to fetch feedback data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsAnalyzing(true)
    setError(null)
    try {
      const feedbackData: FeedbackAnalysisRequest = {
        source,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        message: message.trim(),
        interview_type: interviewType.trim() || undefined,
        stage: stage.trim() || undefined
      }

      const result = await feedbackApi.analyzeAndSave(feedbackData)
      
      if (result.analysis) {
        setCurrentAnalysis(result.analysis)
        setShowForm(false)
        // Refresh data
        await fetchData()
      } else if (result.analysis_error) {
        setError(result.analysis_error)
      }
    } catch (error: any) {
      console.error('Failed to analyze feedback:', error)
      setError(error?.response?.data?.message || error?.message || 'Failed to analyze feedback. Please make sure the Python AI service is running.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null)
    setShowForm(true)
    setMessage('')
    setCompany('')
    setRole('')
    setInterviewType('')
    setStage('')
  }

  const handleViewAnalysis = (analysis: FeedbackAnalysis) => {
    setCurrentAnalysis(analysis)
    setShowForm(false)
    setActiveTab('analyze')
  }

  const handleUpdatePriority = async (id: number, status: LearningPriority['status']) => {
    try {
      await feedbackApi.updateLearningPriority(id, { status })
      await fetchData()
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderSourceIcon = (sourceType: string) => {
    const sourceConfig = FEEDBACK_SOURCES.find(s => s.value === sourceType)
    if (sourceConfig) {
      const IconComponent = sourceConfig.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <MessageSquare className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Skeleton width={300} height={32} className="mb-2 bg-gray-200" />
            <Skeleton width={400} height={20} className="bg-gray-200" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton height={400} className="bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Career Feedback Analysis
              </h1>
              <p className="text-base text-gray-600">
                AI-powered analysis of rejections and feedback to help you improve
              </p>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                    <p className="text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">{stats.interviews}</p>
                    <p className="text-gray-500">Interviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-gray-900">{analyses.length}</p>
                    <p className="text-gray-500">Analyzed</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'analyze'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4 inline-block mr-2" />
              Analyze
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              History ({analyses.length})
            </button>
            <button
              onClick={() => setActiveTab('priorities')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'priorities'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ListTodo className="w-4 h-4 inline-block mr-2" />
              Learning Priorities ({priorities.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Form or Analysis Summary */}
            <div className="space-y-6">
              {showForm ? (
                <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        Add Feedback
                      </h2>
                      <p className="text-sm text-gray-600">
                        Paste rejection email, interview feedback, or your reflection
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>

                  <form onSubmit={handleAnalyze} className="space-y-4">
                    {/* Source Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Feedback Source
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {FEEDBACK_SOURCES.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSource(s.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                              source === s.value
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <s.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Company & Role */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Company <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g., Google"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Role <span className="text-gray-400">(optional)</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Software Engineer"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interview Type & Stage (conditional) */}
                    {(source === 'interview_feedback' || source === 'rejection_email') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Interview Type <span className="text-gray-400">(optional)</span>
                          </label>
                          <select
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          >
                            <option value="">Select type...</option>
                            <option value="phone_screen">Phone Screen</option>
                            <option value="technical">Technical Interview</option>
                            <option value="behavioral">Behavioral Interview</option>
                            <option value="system_design">System Design</option>
                            <option value="coding">Coding Challenge</option>
                            <option value="onsite">Onsite</option>
                            <option value="final">Final Round</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Stage <span className="text-gray-400">(optional)</span>
                          </label>
                          <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          >
                            <option value="">Select stage...</option>
                            <option value="screening">Initial Screening</option>
                            <option value="round_1">Round 1</option>
                            <option value="round_2">Round 2</option>
                            <option value="round_3">Round 3+</option>
                            <option value="final">Final Round</option>
                            <option value="offer">After Offer</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Feedback Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Feedback Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          source === 'rejection_email'
                            ? 'Paste the rejection email here...'
                            : source === 'interview_feedback'
                            ? 'Describe the feedback you received from the interview...'
                            : source === 'self_reflection'
                            ? 'Write your thoughts on what went wrong and why...'
                            : 'Paste the feedback from your mentor...'
                        }
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                        required
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Analysis Failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isAnalyzing || !message.trim()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze & Save
                        </>
                      )}
                    </button>
                  </form>
                </section>
              ) : currentAnalysis ? (
                <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderSourceIcon(currentAnalysis.source)}
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {currentAnalysis.source.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getConfidenceColor(currentAnalysis.confidence_level)}`}>
                          {currentAnalysis.confidence_level} confidence
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {currentAnalysis.company || 'Unknown Company'}
                        {currentAnalysis.role && ` - ${currentAnalysis.role}`}
                      </h2>
                    </div>
                    <button
                      onClick={handleNewAnalysis}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      New Analysis
                    </button>
                  </div>

                  {/* Readiness Score */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Readiness Score</span>
                      <span className={`text-2xl font-bold ${getReadinessColor(currentAnalysis.readiness_score)}`}>
                        {currentAnalysis.readiness_score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getReadinessBg(currentAnalysis.readiness_score)}`}
                        style={{ width: `${currentAnalysis.readiness_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Message */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">AI Summary</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {currentAnalysis.summary_message}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </div>

            {/* Right: Detailed Analysis */}
            {currentAnalysis && !showForm && (
              <div className="space-y-4">
                {/* Identified Reasons */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('reasons')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Identified Reasons</h3>
                        <p className="text-xs text-gray-500">{currentAnalysis.identified_reasons?.length || 0} reasons found</p>
                      </div>
                    </div>
                    {expandedSections.reasons ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {expandedSections.reasons && currentAnalysis.identified_reasons?.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                      {currentAnalysis.identified_reasons.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Skill Gaps (Technical, Behavioral, Resume) */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('gaps')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Target className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Gaps Identified</h3>
                        <p className="text-xs text-gray-500">
                          {(currentAnalysis.skill_gaps?.length || 0) + 
                           (currentAnalysis.technical_gaps?.length || 0) + 
                           (currentAnalysis.behavioral_gaps?.length || 0)} total gaps
                        </p>
                      </div>
                    </div>
                    {expandedSections.gaps ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {expandedSections.gaps && (
                    <div className="px-4 pb-4 space-y-4">
                      {/* Technical Gaps */}
                      {currentAnalysis.technical_gaps && currentAnalysis.technical_gaps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Technical</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.technical_gaps.map((gap, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Skill Gaps */}
                      {currentAnalysis.skill_gaps && currentAnalysis.skill_gaps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.skill_gaps.map((gap, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Behavioral Gaps */}
                      {currentAnalysis.behavioral_gaps && currentAnalysis.behavioral_gaps.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Behavioral</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.behavioral_gaps.map((gap, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Resume Issues */}
                      {currentAnalysis.resume_issues && currentAnalysis.resume_issues.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resume Issues</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.resume_issues.map((issue, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Strengths */}
                      {currentAnalysis.strengths_detected && currentAnalysis.strengths_detected.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Strengths Detected</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentAnalysis.strengths_detected.map((strength, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {strength}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Recommended Actions */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('actions')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                        <p className="text-xs text-gray-500">{currentAnalysis.recommended_actions?.length || 0} actions</p>
                      </div>
                    </div>
                    {expandedSections.actions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {expandedSections.actions && currentAnalysis.recommended_actions?.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                      {currentAnalysis.recommended_actions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                          <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 text-xs font-medium text-emerald-700">
                            {i + 1}
                          </div>
                          <span className="text-sm text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Learning Plan */}
                <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('learning')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">Learning Plan</h3>
                        <p className="text-xs text-gray-500">{currentAnalysis.learning_plan?.length || 0} items</p>
                      </div>
                    </div>
                    {expandedSections.learning ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>
                  {expandedSections.learning && currentAnalysis.learning_plan?.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                      {currentAnalysis.learning_plan.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900">{item.area}</span>
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.timeline}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.action}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Project Suggestions */}
                {currentAnalysis.project_suggestions && currentAnalysis.project_suggestions.length > 0 && (
                  <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('projects')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">Project Ideas</h3>
                          <p className="text-xs text-gray-500">{currentAnalysis.project_suggestions.length} suggestions</p>
                        </div>
                      </div>
                      {expandedSections.projects ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    {expandedSections.projects && (
                      <div className="px-4 pb-4 space-y-2">
                        {currentAnalysis.project_suggestions.map((project, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 border border-violet-100">
                            <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{project}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Next Steps */}
                {currentAnalysis.next_steps && currentAnalysis.next_steps.length > 0 && (
                  <section className="bg-gray-900 rounded-xl p-4 text-white">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Next Steps
                    </h3>
                    <div className="space-y-2">
                      {currentAnalysis.next_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-200">{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Empty state when no analysis and form shown */}
            {showForm && !currentAnalysis && analyses.length > 0 && (
              <div className="space-y-4">
                <section className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Recent Analyses</h3>
                  <div className="space-y-2">
                    {analyses.slice(0, 5).map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => handleViewAnalysis(analysis)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          {renderSourceIcon(analysis.source)}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {analysis.company || 'Unknown'} - {analysis.role || 'Unknown Role'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${getReadinessColor(analysis.readiness_score)}`}>
                          {analysis.readiness_score}%
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {analyses.length === 0 ? (
              <div className="bg-[#faf7f2] rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Submit your first feedback to get AI-powered insights
                </p>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Analyze Feedback
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => handleViewAnalysis(analysis)}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {renderSourceIcon(analysis.source)}
                        <span className="text-xs font-medium text-gray-500 capitalize">
                          {analysis.source.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-xl font-bold ${getReadinessColor(analysis.readiness_score)}`}>
                        {analysis.readiness_score}%
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {analysis.company || 'Unknown Company'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {analysis.role || 'Unknown Role'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {analysis.skill_gaps?.slice(0, 3).map((gap, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">
                          {gap}
                        </span>
                      ))}
                      {(analysis.skill_gaps?.length || 0) > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-600">
                          +{analysis.skill_gaps!.length - 3} more
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning Priorities Tab */}
        {activeTab === 'priorities' && (
          <div className="space-y-4">
            {priorities.length === 0 ? (
              <div className="bg-[#faf7f2] rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No learning priorities yet</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Analyze feedback to generate personalized learning priorities
                </p>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  Analyze Feedback
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Learning Priorities</h3>
                  <p className="text-sm text-gray-600">Track your progress on AI-generated learning goals</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {priorities.map((priority) => (
                    <div key={priority.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{priority.area}</span>
                            {priority.timeline && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {priority.timeline}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{priority.action}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={priority.status}
                            onChange={(e) => handleUpdatePriority(priority.id, e.target.value as LearningPriority['status'])}
                            className={`px-2 py-1 rounded-md text-xs font-medium border-0 cursor-pointer ${getStatusColor(priority.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="skipped">Skipped</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
