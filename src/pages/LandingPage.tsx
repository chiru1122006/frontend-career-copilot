import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock } from 'lucide-react';

// --- Components ---

// Simplified Landing Page - "Remove all content and keep only login"
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Brand Icon */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-stone-200 shadow-xl shadow-stone-200/50">
        <Sparkles className="w-10 h-10 text-stone-900" />
      </div>

      {/* Main Action: Login Button */}
      {/* Design: Solid black button with white text for high contrast */}
      <Link 
        to="/login" 
        className="group px-10 py-3.5 bg-black text-white rounded-lg font-bold text-lg hover:bg-stone-800 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-stone-900/20"
      >
        Login
        <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
      </Link>

      {/* Spacer */}
      <div className="h-12"></div>

      {/* Description - Just 2 lines about Career AI */}
      <div className="max-w-lg space-y-4 px-4">
        <p className="text-xl font-bold text-stone-900">
          Your autonomous AI agent for career planning.
        </p>
        <p className="text-base text-stone-600 leading-relaxed font-medium">
          We analyze your profile to automatically identify gaps, build weekly roadmaps, and match you with the right opportunities.
        </p>
      </div>

    </div>
  );
};

const Login = () => {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/50">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-stone-100 rounded-lg">
                <Lock className="w-5 h-5 text-stone-900" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">Sign In</h2>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-stone-700 mb-1">Email</label>
            <input 
                id="email"
                type="email" 
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" 
                placeholder="you@example.com" 
                required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-stone-700 mb-1">Password</label>
            <input 
                id="password"
                type="password" 
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all" 
                placeholder="••••••••" 
                required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-black hover:bg-stone-800 text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-lg shadow-stone-900/10"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors font-semibold">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
