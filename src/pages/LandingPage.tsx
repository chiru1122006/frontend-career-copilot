import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-amber-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Career AI
        </h1>
        
        {/* Description - 3 lines */}
        <div className="text-gray-700 text-lg mb-12 space-y-2 leading-relaxed">
          <p>AI-powered career guidance tailored to your goals.</p>
          <p>Get personalized roadmaps, skill analysis, and insights.</p>
          <p>Transform your career journey with intelligent planning.</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-10 py-3 rounded-lg font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="w-full sm:w-auto px-10 py-3 rounded-lg font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
