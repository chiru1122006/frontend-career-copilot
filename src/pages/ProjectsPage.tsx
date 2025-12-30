import { useState, useEffect, useRef } from 'react'
import {
  FolderKanban,
  Sparkles,
  Plus,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Github,
  CheckCircle2,
  Circle,
  PauseCircle,
  PlayCircle,
  Trash2,
  X,
  Send,
  Lightbulb,
  BookOpen,
  Target
} from 'lucide-react'
import { projectsApi, type Project, type ProjectSuggestion, type ImprovedProject } from '../services/api'
import { Skeleton } from '../components'

type ConversationStage = 'initial' | 'waiting_for_idea' | 'showing_suggestions' | 'showing_improved' | 'confirmed'

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  suggestions?: ProjectSuggestion[]
  improvedProject?: ImprovedProject
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'Intermediate':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Advanced':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case 'in_progress':
      return <PlayCircle className="w-4 h-4 text-blue-600" />
    case 'paused':
      return <PauseCircle className="w-4 h-4 text-amber-600" />
    case 'planned':
      return <Circle className="w-4 h-4 text-gray-400" />
    default:
      return <Circle className="w-4 h-4 text-gray-400" />
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'in_progress':
      return 'In Progress'
    case 'paused':
      return 'Paused'
    case 'planned':
      return 'Planned'
    default:
      return status
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showProjectDetail, setShowProjectDetail] = useState<Project | null>(null)
  const [stats, setStats] = useState<{ total: number; planned: number; in_progress: number; completed: number; paused: number } | null>(null)

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [conversationStage, setConversationStage] = useState<ConversationStage>('initial')
  const [currentSuggestions, setCurrentSuggestions] = useState<ProjectSuggestion[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectSuggestion | ImprovedProject | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProjects()
    fetchStats()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await projectsApi.getAll()
      setProjects(response.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await projectsApi.getStats()
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleOpenAIModal = async () => {
    setShowAIModal(true)
    setChatMessages([])
    setConversationStage('initial')
    setCurrentSuggestions([])
    setSelectedProject(null)
    setUserInput('')
    
    // Start conversation
    setIsAILoading(true)
    try {
      const analysis = await projectsApi.analyze()
      const openingMessage = analysis.analysis?.opening_message || 
        "Based on your skills, I can suggest personalized project ideas. Do you already have any project idea in mind?"
      
      setChatMessages([{
        role: 'assistant',
        content: openingMessage
      }])
      setConversationStage('waiting_for_idea')
    } catch (error) {
      console.error('Failed to analyze profile:', error)
      setChatMessages([{
        role: 'assistant',
        content: "Hello! I'm here to help you discover great project ideas. Do you already have a project idea in mind, or would you like me to suggest some based on your skills?"
      }])
      setConversationStage('waiting_for_idea')
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAILoading) return
    
    const message = userInput.trim()
    setUserInput('')
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setIsAILoading(true)
    
    try {
      // Analyze user intent
      const chatResponse = await projectsApi.chat(message, conversationStage, currentSuggestions)
      
      console.log('Chat response:', chatResponse) // Debug log
      
      if (chatResponse.action === 'generate_suggestions') {
        // User wants suggestions
        const suggestions = await projectsApi.suggest(5)
        setCurrentSuggestions(suggestions.suggestions || [])
        setConversationStage('showing_suggestions')
        
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Great! Based on your skills and career goals, here are ${suggestions.suggestions?.length || 0} project ideas tailored for you:\n\n${suggestions.recommendation_note || ''}`,
          suggestions: suggestions.suggestions
        }])
        
      } else if (chatResponse.action === 'improve_idea' && chatResponse.extracted_idea) {
        // User has an idea to improve
        const improved = await projectsApi.improveIdea(chatResponse.extracted_idea)
        setSelectedProject(improved.improved_project)
        setConversationStage('showing_improved')
        
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `I've taken your idea and enhanced it to be more comprehensive and industry-ready! Here's the improved version:`,
          improvedProject: improved.improved_project
        }])
        
      } else if (chatResponse.selected_index !== null && chatResponse.selected_index !== undefined) {
        // User selected a project
        const selected = currentSuggestions[chatResponse.selected_index]
        if (selected) {
          setSelectedProject(selected)
          setConversationStage('confirmed')
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: `Excellent choice! "${selected.project_title}" is a great project that will help you build valuable skills. Would you like me to save this to your projects list?`
          }])
        }
      } else {
        // General response
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: chatResponse.response || "I understand. How else can I help you with your projects?"
        }])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I encountered an issue. Let me try again - would you like me to suggest some project ideas for you?"
      }])
    } finally {
      setIsAILoading(false)
    }
  }

  const handleSelectSuggestion = (suggestion: ProjectSuggestion) => {
    setSelectedProject(suggestion)
    setConversationStage('confirmed')
    setChatMessages(prev => [...prev, 
      { role: 'user', content: `I'll go with "${suggestion.project_title}"` },
      { role: 'assistant', content: `Excellent choice! "${suggestion.project_title}" is a great project that will help you build valuable skills. Click "Add to My Projects" below to save it to your list.` }
    ])
  }

  const handleSaveProject = async () => {
    if (!selectedProject) return
    
    setIsAILoading(true)
    try {
      await projectsApi.saveAIProject(selectedProject)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `🎉 Project saved successfully! "${selectedProject.project_title}" has been added to your projects. You can find it in your projects list and start working on it anytime!`
      }])
      setConversationStage('initial')
      await fetchProjects()
      await fetchStats()
    } catch (error) {
      console.error('Failed to save project:', error)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "I couldn't save the project. Please try again."
      }])
    } finally {
      setIsAILoading(false)
    }
  }

  const handleUpdateStatus = async (projectId: number, newStatus: string) => {
    try {
      await projectsApi.update(projectId, { status: newStatus as Project['status'] })
      await fetchProjects()
      await fetchStats()
    } catch (error) {
      console.error('Failed to update project status:', error)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await projectsApi.delete(projectId)
      await fetchProjects()
      await fetchStats()
      setShowProjectDetail(null)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton width={300} height={32} className="mb-2 bg-gray-200" />
                <Skeleton width={400} height={20} className="bg-gray-200" />
              </div>
              <Skeleton width={180} height={44} className="bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height={280} className="bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
                <FolderKanban className="w-8 h-8" />
                Your Projects
              </h1>
              <p className="text-base text-gray-600">
                Build portfolio-worthy projects aligned with your career goals
              </p>
            </div>
            <button
              onClick={handleOpenAIModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Get Project Ideas
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <div className="border-b border-gray-200 bg-[#faf7f2]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">Planned:</span>
                <span className="font-medium text-gray-700">{stats.planned}</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="w-3 h-3 text-blue-600" />
                <span className="text-gray-600">In Progress:</span>
                <span className="font-medium text-blue-700">{stats.in_progress}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-700">{stats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your portfolio with AI-recommended projects tailored to your skills and career goals.
            </p>
            <button
              onClick={handleOpenAIModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Get Project Ideas
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-[#faf7f2] rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => setShowProjectDetail(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 pr-2">
                    {project.project_title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.skills_used.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {skill}
                    </span>
                  ))}
                  {project.skills_used.length > 4 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                      +{project.skills_used.length - 4}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    {getStatusIcon(project.status)}
                    <span className="text-gray-600">{getStatusLabel(project.status)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.demo_url && (
                      <a 
                        href={project.demo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all" />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Project Card */}
            <button
              onClick={handleOpenAIModal}
              className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[200px] group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-all">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
              </div>
              <span className="font-medium text-gray-600 group-hover:text-gray-900">Add New Project</span>
              <span className="text-sm text-gray-500 mt-1">Get AI suggestions</span>
            </button>
          </div>
        )}
      </main>

      {/* AI Chat Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Project Ideas Assistant</h2>
                  <p className="text-sm text-gray-600">Get personalized project recommendations</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' 
                    ? 'bg-gray-900 text-white rounded-2xl rounded-tr-md px-4 py-3' 
                    : 'bg-[#faf7f2] text-gray-900 rounded-2xl rounded-tl-md px-4 py-3'}`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Suggestions Grid */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {msg.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-900 group-hover:text-gray-700">
                                {i + 1}. {suggestion.project_title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(suggestion.difficulty)}`}>
                                {suggestion.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{suggestion.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.skills_used.slice(0, 4).map((skill, j) => (
                                <span key={j} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Improved Project Display */}
                    {msg.improvedProject && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{msg.improvedProject.project_title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(msg.improvedProject.difficulty)}`}>
                            {msg.improvedProject.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{msg.improvedProject.description}</p>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Key Features</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {msg.improvedProject.features.slice(0, 5).map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {msg.improvedProject.improvements_made && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Improvements Made</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {msg.improvedProject.improvements_made.map((imp, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isAILoading && (
                <div className="flex justify-start">
                  <div className="bg-[#faf7f2] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Save Project Button */}
            {selectedProject && conversationStage === 'confirmed' && (
              <div className="px-6 py-3 border-t border-gray-200 bg-[#faf7f2]">
                <button
                  onClick={handleSaveProject}
                  disabled={isAILoading}
                  className="w-full py-2.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to My Projects
                </button>
              </div>
            )}

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={conversationStage === 'waiting_for_idea' 
                    ? "Type your project idea or say 'no' for suggestions..." 
                    : "Type a message..."}
                  disabled={isAILoading}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isAILoading || !userInput.trim()}
                  className="p-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{showProjectDetail.project_title}</h2>
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getDifficultyColor(showProjectDetail.difficulty)}`}>
                    {showProjectDetail.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(showProjectDetail.status)}
                    {getStatusLabel(showProjectDetail.status)}
                  </div>
                  {showProjectDetail.ai_generated && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      AI Generated
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProjectDetail(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Description</h3>
                <p className="text-gray-700">{showProjectDetail.description}</p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Skills Used</h3>
                <div className="flex flex-wrap gap-2">
                  {showProjectDetail.skills_used.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Key Features</h3>
                <ul className="space-y-2">
                  {showProjectDetail.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              {showProjectDetail.tech_stack && Object.keys(showProjectDetail.tech_stack).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Tech Stack</h3>
                  <div className="space-y-2">
                    {Object.entries(showProjectDetail.tech_stack).map(([category, techs]) => (
                      techs && techs.length > 0 && (
                        <div key={category} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 capitalize w-20">{category}:</span>
                          <div className="flex flex-wrap gap-1">
                            {techs.map((tech, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {showProjectDetail.learning_outcomes && showProjectDetail.learning_outcomes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Learning Outcomes</h3>
                  <ul className="space-y-2">
                    {showProjectDetail.learning_outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume Value */}
              {showProjectDetail.resume_value && (
                <div className="bg-[#faf7f2] rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    Resume Value
                  </h3>
                  <p className="text-gray-600 text-sm">{showProjectDetail.resume_value}</p>
                </div>
              )}

              {/* Links */}
              {(showProjectDetail.github_url || showProjectDetail.demo_url) && (
                <div className="flex gap-3">
                  {showProjectDetail.github_url && (
                    <a
                      href={showProjectDetail.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    >
                      <Github className="w-4 h-4" />
                      View Code
                    </a>
                  )}
                  {showProjectDetail.demo_url && (
                    <a
                      href={showProjectDetail.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 bg-[#faf7f2]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <select
                    value={showProjectDetail.status}
                    onChange={(e) => handleUpdateStatus(showProjectDetail.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
                <button
                  onClick={() => handleDeleteProject(showProjectDetail.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
