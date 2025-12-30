import { useState, useEffect } from 'react'
import { 
  Briefcase, 
  ExternalLink, 
  Plus, 
  Brain, 
  RefreshCw,
  Building2,
  Calendar,
  X,
  Check,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import api from '../services/api'
import type { Application } from '../types'
import { formatDate } from '../lib/utils'

interface MatchResult {
  opportunities: Array<{
    company: string
    role: string
    match_percentage: number
    reason?: string
    tips?: string
    missing_skills?: string[]
  }>
  total: number
}

interface InterviewPrepSuggestion {
  key_skills_to_highlight: Array<{
    skill: string
    why: string
    how_to_demonstrate: string
  }>
  suggested_projects: Array<{
    title: string
    description: string
    skills_demonstrated: string[]
    relevance: string
    complexity: string
    estimated_time: string
  }>
  technical_topics_to_study: Array<{
    topic: string
    priority: string
    resources: string[]
  }>
  interview_preparation_tips: Array<{
    category: string
    tip: string
    why: string
  }>
  common_questions: Array<{
    question: string
    approach: string
    example_points: string[]
  }>
  company_culture_prep: {
    company_values: string
    questions_to_ask: string[]
    alignment_points: string[]
  }
  confidence_boosters: string[]
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMatching, setIsMatching] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMatchResultModal, setShowMatchResultModal] = useState(false)
  const [showInterviewPrepModal, setShowInterviewPrepModal] = useState(false)
  const [loadingPrepId, setLoadingPrepId] = useState<number | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepSuggestion | null>(null)
  const [isPrepCached, setIsPrepCached] = useState(false)
  const [newApp, setNewApp] = useState({
    company: '',
    role: '',
    job_url: '',
    deadline: '',
    notes: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications')
      setApplications(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatchOpportunities = async () => {
    setIsMatching(true)
    try {
      const response = await api.post('/agent/match-opportunities')
      console.log('Match opportunities response:', response.data)
      if (response.data.status === 'success') {
        const data = response.data.data || response.data
        if (data.opportunities && data.opportunities.length > 0) {
          setMatchResult({
            opportunities: data.opportunities,
            total: data.total || data.opportunities.length
          })
          setShowMatchResultModal(true)
        }
        fetchApplications()
      }
    } catch (error) {
      console.error('Failed to match opportunities:', error)
    } finally {
      setIsMatching(false)
    }
  }

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/applications', newApp)
      setNewApp({ company: '', role: '', job_url: '', deadline: '', notes: '' })
      setShowAddModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Failed to add application:', error)
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/applications/${id}`, { status })
      fetchApplications()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      await api.delete(`/applications/${id}`)
      fetchApplications()
    } catch (error) {
      console.error('Failed to delete application:', error)
    }
  }

  const handleGetInterviewPrep = async (appId: number) => {
    setLoadingPrepId(appId)
    try {
      console.log('Fetching interview prep for app:', appId)
      const response = await api.get(`/applications/${appId}/interview-prep`)
      console.log('Interview prep response:', response.data)
      
      if (response.data.status === 'success') {
        const prepData = response.data.data?.suggestions || response.data.data?.result?.suggestions || response.data.data
        const isCached = response.data.data?.cached || false
        console.log('Interview prep data:', prepData)
        console.log('Is cached:', isCached)
        
        if (prepData && typeof prepData === 'object' && Object.keys(prepData).length > 0) {
          setInterviewPrep(prepData)
          setIsPrepCached(isCached)
          setShowInterviewPrepModal(true)
        } else {
          console.error('No interview prep data found in response')
          alert('No interview preparation data available. The AI may have failed to generate complete data. Please try again.')
        }
      } else {
        console.error('Interview prep request failed:', response.data)
        alert('Failed to generate interview preparation. Please try again.')
      }
    } catch (error) {
      console.error('Failed to get interview prep:', error)
      alert('Error generating interview preparation. Please check console for details.')
    } finally {
      setLoadingPrepId(null)
    }
  }

  const statusOptions = [
    { value: 'saved', label: 'Saved', icon: Clock },
    { value: 'applied', label: 'Applied', icon: Check },
    { value: 'interviewing', label: 'Interviewing', icon: Building2 },
    { value: 'offered', label: 'Offered', icon: TrendingUp },
    { value: 'rejected', label: 'Rejected', icon: X },
  ]

  const getMatchBadgeStyle = (percentage: number) => {
    if (percentage >= 80) return 'bg-[#111111] text-white'
    if (percentage >= 60) return 'bg-[#6b7280] text-white'
    return 'bg-[#e5e5e5] text-[#111111]'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#111111] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6b7280]">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] -m-4 lg:-m-8">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#111111]">
                Applications & Insights
              </h1>
              <p className="text-[#6b7280] mt-1 text-sm">
                AI-powered tracking and feedback on your job applications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMatchOpportunities}
                disabled={isMatching}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#f3f3f3] transition-colors disabled:opacity-50"
              >
                {isMatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    AI Match
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#000000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statusOptions.map((status) => {
            const count = applications.filter(a => a.status === status.value).length
            return (
              <div key={status.value} className="bg-white rounded-lg p-5 border border-[#e5e5e5] hover:border-[#111111] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <status.icon className="w-4 h-4 text-[#6b7280]" />
                  <span className="text-xs text-[#6b7280] font-medium">{status.label}</span>
                </div>
                <p className="text-2xl font-semibold text-[#111111]">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Match Results Banner */}
        {matchResult && matchResult.opportunities.length > 0 && (
          <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#111111] text-lg mb-1">
                  Found {matchResult.total} Matching Opportunities
                </h3>
                <p className="text-sm text-[#6b7280] mb-4">
                  Based on your profile, here are some positions that align with your skills and experience.
                </p>
                
                <div className="grid gap-3">
                  {matchResult.opportunities.map((opp, index) => (
                    <div 
                      key={index}
                      className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-[#111111]">{opp.role}</h4>
                          <p className="text-sm text-[#6b7280]">{opp.company}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchBadgeStyle(opp.match_percentage)}`}>
                          {opp.match_percentage}% match
                        </span>
                      </div>
                      
                      {(opp.reason || opp.tips) && (
                        <p className="text-sm text-[#111111] leading-relaxed mb-3">
                          {opp.reason || opp.tips}
                        </p>
                      )}

                      {opp.missing_skills && opp.missing_skills.length > 0 && (
                        <div className="pt-3 border-t border-[#e5e5e5]">
                          <p className="text-xs text-[#6b7280] mb-2">Skills to develop:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {opp.missing_skills.map((skill, i) => (
                              <span 
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#111111]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setMatchResult(null)}
                  className="mt-4 text-sm text-[#6b7280] hover:text-[#111111] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e5e5e5] p-12 text-center">
            <div className="w-16 h-16 rounded-lg bg-[#faf7f2] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-[#6b7280]" />
            </div>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              No applications yet
            </h3>
            <p className="text-sm text-[#6b7280] mb-6 max-w-md mx-auto">
              Start tracking your job applications or let AI find matching opportunities for you.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleMatchOpportunities}
                disabled={isMatching}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#f3f3f3] transition-colors"
              >
                <Brain className="w-4 h-4" />
                Find Matches
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111111] text-white rounded-lg text-sm font-medium hover:bg-[#000000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg border border-[#e5e5e5] p-6 hover:border-[#111111] transition-all">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[#111111] text-lg">
                        {app.role}
                      </h3>
                      {app.match_percentage > 0 && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchBadgeStyle(app.match_percentage)}`}>
                          {app.match_percentage}% match
                        </span>
                      )}
                    </div>
                    <p className="text-[#6b7280] mb-3">{app.company}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                      {app.deadline && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Due {formatDate(app.deadline)}
                        </span>
                      )}
                      {app.job_url && (
                        <a 
                          href={app.job_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[#111111] hover:underline transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View posting
                        </a>
                      )}
                    </div>

                    {app.ai_tips && (
                      <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                        <div className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5]">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-[#111111]" />
                            <span className="text-sm font-medium text-[#111111]">AI Insight</span>
                          </div>
                          <p className="text-sm text-[#111111] leading-relaxed">{app.ai_tips}</p>
                        </div>
                      </div>
                    )}

                    {/* Interview Prep Button */}
                    <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                      <button
                        onClick={() => handleGetInterviewPrep(app.id)}
                        disabled={loadingPrepId === app.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#faf7f2] border border-[#e5e5e5] text-[#111111] rounded-lg text-sm font-medium hover:bg-[#f3f3f3] hover:border-[#111111] transition-all disabled:opacity-50"
                      >
                        {loadingPrepId === app.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Interview Prep
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className="px-3 py-2 rounded-lg text-sm bg-white border border-[#e5e5e5] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#6b7280]">
            {applications.length} application{applications.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl border border-[#e5e5e5]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#111111]">
                Add Application
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6b7280] hover:text-[#111111] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#e5e5e5] text-[#111111] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all"
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newApp.role}
                  onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#e5e5e5] text-[#111111] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Job URL (optional)
                </label>
                <input
                  type="url"
                  value={newApp.job_url}
                  onChange={(e) => setNewApp({ ...newApp, job_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#e5e5e5] text-[#111111] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Deadline (optional)
                </label>
                <input
                  type="date"
                  value={newApp.deadline}
                  onChange={(e) => setNewApp({ ...newApp, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#e5e5e5] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-[#111111] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors"
                >
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Results Modal */}
      {showMatchResultModal && matchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-[#e5e5e5]">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#111111]">
                    AI Match Results
                  </h2>
                  <p className="text-sm text-[#6b7280] mt-1">
                    Found {matchResult.total} matching opportunities
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMatchResultModal(false)}
                className="text-[#6b7280] hover:text-[#111111] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {matchResult.opportunities.map((opp, index) => (
                <div 
                  key={index}
                  className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5] hover:border-[#111111] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[#111111]">
                        {opp.role}
                      </h3>
                      <p className="text-sm text-[#6b7280]">
                        {opp.company}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchBadgeStyle(opp.match_percentage)}`}>
                      {opp.match_percentage}% match
                    </span>
                  </div>

                  {(opp.reason || opp.tips) && (
                    <p className="text-sm text-[#111111] mb-3 leading-relaxed">
                      {opp.reason || opp.tips}
                    </p>
                  )}

                  {opp.missing_skills && opp.missing_skills.length > 0 && (
                    <div className="pt-3 border-t border-[#e5e5e5]">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-[#6b7280] mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#111111] mb-2">
                            Skills to improve:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {opp.missing_skills.map((skill, i) => (
                              <span 
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#111111]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex justify-end">
              <button
                onClick={() => setShowMatchResultModal(false)}
                className="px-6 py-2.5 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Prep Modal */}
      {showInterviewPrepModal && interviewPrep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-xl border border-[#e5e5e5]">
            <div className="flex items-start justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-[#e5e5e5]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#111111] flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#111111]">
                      Interview Preparation Guide
                    </h2>
                    {isPrepCached && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6b7280] mt-1">
                    AI-powered suggestions to ace your interview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInterviewPrepModal(false)}
                className="text-[#6b7280] hover:text-[#111111] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Loading State */}
              {!interviewPrep && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-3 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-[#6b7280]">Generating interview preparation...</p>
                </div>
              )}

              {/* Debug Info */}
              {interviewPrep && Object.keys(interviewPrep).length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-[#6b7280] mx-auto mb-4" />
                  <p className="text-sm text-[#6b7280]">No interview preparation data available.</p>
                  <pre className="mt-4 text-xs text-left bg-gray-50 p-4 rounded overflow-auto">
                    {JSON.stringify(interviewPrep, null, 2)}
                  </pre>
                </div>
              )}

              {/* Confidence Boosters */}
              {interviewPrep && interviewPrep.confidence_boosters && interviewPrep.confidence_boosters.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-[#111111] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {interviewPrep.confidence_boosters.map((boost, i) => (
                      <li key={i} className="text-sm text-[#111111] flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{boost}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Skills to Highlight */}
              {interviewPrep && interviewPrep.key_skills_to_highlight && interviewPrep.key_skills_to_highlight.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Key Skills to Highlight</h3>
                  <div className="grid gap-3">
                    {interviewPrep.key_skills_to_highlight.map((skill, i) => (
                      <div key={i} className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5]">
                        <h4 className="font-medium text-[#111111] mb-1">{skill.skill}</h4>
                        <p className="text-sm text-[#6b7280] mb-2">{skill.why}</p>
                        <p className="text-sm text-[#111111]">
                          <span className="font-medium">How to demonstrate:</span> {skill.how_to_demonstrate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Projects */}
              {interviewPrep && interviewPrep.suggested_projects && interviewPrep.suggested_projects.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Portfolio Projects to Build</h3>
                  <div className="grid gap-3">
                    {interviewPrep.suggested_projects.map((project, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-[#e5e5e5]">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-[#111111]">{project.title}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-[#faf7f2] text-[#111111] border border-[#e5e5e5]">
                            {project.complexity}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b7280] mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.skills_demonstrated.map((skill, j) => (
                            <span key={j} className="px-2 py-1 text-xs rounded-md bg-[#111111] text-white">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-[#6b7280]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {project.estimated_time} • {project.relevance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Interview Questions */}
              {interviewPrep && interviewPrep.common_questions && interviewPrep.common_questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Common Interview Questions</h3>
                  <div className="space-y-3">
                    {interviewPrep.common_questions.map((q, i) => (
                      <div key={i} className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5]">
                        <p className="font-medium text-[#111111] mb-2">"{q.question}"</p>
                        <p className="text-sm text-[#6b7280] mb-2">
                          <span className="font-medium">Approach:</span> {q.approach}
                        </p>
                        {q.example_points && q.example_points.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-[#111111] mb-1">Key points to mention:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {q.example_points.map((point, j) => (
                                <li key={j} className="text-sm text-[#6b7280]">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Tips */}
              {interviewPrep && interviewPrep.interview_preparation_tips && interviewPrep.interview_preparation_tips.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Preparation Tips</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {interviewPrep.interview_preparation_tips.map((tip, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 border border-[#e5e5e5]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs rounded-md bg-[#faf7f2] text-[#111111] font-medium">
                            {tip.category}
                          </span>
                        </div>
                        <p className="text-sm text-[#111111] font-medium mb-1">{tip.tip}</p>
                        <p className="text-xs text-[#6b7280]">{tip.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Culture */}
              {interviewPrep && interviewPrep.company_culture_prep && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Company Culture & Fit</h3>
                  <div className="bg-[#faf7f2] rounded-lg p-4 border border-[#e5e5e5] space-y-3">
                    {interviewPrep.company_culture_prep.company_values && (
                      <div>
                        <p className="text-sm font-medium text-[#111111] mb-1">Company Values</p>
                        <p className="text-sm text-[#6b7280]">{interviewPrep.company_culture_prep.company_values}</p>
                      </div>
                    )}
                    {interviewPrep.company_culture_prep.questions_to_ask && interviewPrep.company_culture_prep.questions_to_ask.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-[#111111] mb-2">Questions to Ask</p>
                        <ul className="space-y-1">
                          {interviewPrep.company_culture_prep.questions_to_ask.map((q, i) => (
                            <li key={i} className="text-sm text-[#6b7280] flex items-start gap-2">
                              <span className="text-[#111111]">•</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Topics */}
              {interviewPrep && interviewPrep.technical_topics_to_study && interviewPrep.technical_topics_to_study.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#111111] mb-3">Topics to Study</h3>
                  <div className="grid gap-2">
                    {interviewPrep.technical_topics_to_study.map((topic, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-[#e5e5e5]">
                        <div className="flex-1">
                          <span className="font-medium text-[#111111] text-sm">{topic.topic}</span>
                          {topic.resources && topic.resources.length > 0 && (
                            <p className="text-xs text-[#6b7280] mt-1">
                              Resources: {topic.resources.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          topic.priority === 'high' ? 'bg-red-50 text-red-700' :
                          topic.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {topic.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e5e5e5] flex justify-end">
              <button
                onClick={() => setShowInterviewPrepModal(false)}
                className="px-6 py-2.5 bg-[#111111] text-white rounded-lg font-medium hover:bg-[#000000] transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
