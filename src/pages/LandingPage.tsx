import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';

// Minimal Landing Page Component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Brand Icon (Subtle) */}
      <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm">
        <Sparkles className="w-10 h-10 text-blue-400" />
      </div>

      {/* Main Action: Login Button */}
      {/* Removed the 'colorful premium' gradients, kept it clean and high-contrast */}
      <Link 
        to="/login" 
        className="group px-10 py-3.5 bg-white text-slate-950 rounded-lg font-bold text-lg hover:bg-slate-200 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-white/5"
      >
        Login
        <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
      </Link>

      {/* Spacer */}
      <div className="h-12"></div>

      {/* 2 Lines about Career AI */}
      <div className="max-w-lg space-y-4 px-4">
        <p className="text-xl font-medium text-slate-200">
          Your autonomous AI agent for career planning and skill development.
        </p>
        <p className="text-base text-slate-400 leading-relaxed">
          We analyze your profile to automatically identify gaps, build weekly roadmaps, and match you with the right opportunities.
        </p>
      </div>

    </div>
  );
};

// Placeholder Login Page
const Login = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
            <Lock className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Sign In</h2>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input type="email" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input type="password" className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" placeholder="••••••••" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
            Continue
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

// Main App Router
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
