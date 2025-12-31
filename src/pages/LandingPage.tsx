import { Link } from 'react-router-dom'
import { Sparkles, Brain, Target, TrendingUp, Zap, Award, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="max-w-4xl w-full relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">Career AI</span>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-12 shadow-2xl">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Career Companion
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your career journey with intelligent AI agents that understand, plan, and grow with you
            </p>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI-Powered Analysis</h3>
                <p className="text-gray-400 text-sm">Deep insights into your skills and career potential</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Skill Gap Detection</h3>
                <p className="text-gray-400 text-sm">Identify and close gaps with personalized recommendations</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Smart Roadmaps</h3>
                <p className="text-gray-400 text-sm">Weekly learning plans tailored to your goals</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/30 transition-colors">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Opportunity Matching</h3>
                <p className="text-gray-400 text-sm">Get matched with jobs that fit your profile</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/30 transition-colors">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Career Readiness Score</h3>
                <p className="text-gray-400 text-sm">Track your progress with dynamic career readiness metrics</p>
              </div>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 mb-12 border border-white/5">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Career AI?</h3>
            <ul className="space-y-4">
              {[
                'Multi-agent AI system that thinks, reasons, and plans like a real mentor',
                'Personalized learning roadmaps based on your unique profile',
                'Real-time feedback analysis that turns rejections into insights',
                'Intelligent project suggestions to build your portfolio',
                'Resume generation and tailoring for specific job roles'
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-lg bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-400 mt-8 text-sm">
          Join thousands of students and professionals accelerating their careers with AI
        </p>
      </div>
    </div>
  )
}
