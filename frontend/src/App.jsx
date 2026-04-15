import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeApp from './pages/EmployeeApp';
import GuestPortal from './pages/GuestPortal';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeApp />} />
        <Route path="/guest" element={<GuestPortal />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Navigation */}
        <nav className="py-8 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#111111] rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">V</span>
            </div>
            <span className="font-semibold tracking-tight text-sm">VenueManager</span>
            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] ml-1 border border-gray-200">Agent</span>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <Link to="/guest" className="text-gray-500 hover:text-black transition-colors px-2 py-1">Guest Portal</Link>
            <Link to="/employee" className="text-gray-500 hover:text-black transition-colors px-2 py-1">Staff App</Link>
            <Link to="/admin" className="bg-[#111111] text-white hover:bg-black transition-colors px-4 py-1.5 rounded-md">Admin Console</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="py-24 max-w-2xl">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Deterministic event logistics powered by AI.
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            VenueManager Agent replaces manual spreadsheets with intelligent, real-time staff routing and halluciantion-guarded orchestration frameworks.
          </p>
          <div className="flex gap-4">
            <Link to="/admin" className="bg-[#111111] text-white hover:bg-black transition-colors px-6 py-3 rounded-lg font-medium">
              Initialize Console
            </Link>
            <a href="https://github.com/google/adk" target="_blank" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors px-6 py-3 rounded-lg font-medium shadow-sm">
              Read the ADK Documentation
            </a>
          </div>
        </main>
        
        {/* Abstract Data Visual */}
        <div className="mt-12 mb-24 grid grid-cols-3 gap-6">
           <div className="p-6 bg-white border border-gray-200 rounded-xl enterprise-shadow">
             <span className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Routing Latency</span>
             <span className="text-3xl font-light">12ms</span>
           </div>
           <div className="p-6 bg-white border border-gray-200 rounded-xl enterprise-shadow">
             <span className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Conflict Resolution</span>
             <span className="text-3xl font-light">99.8%</span>
           </div>
           <div className="p-6 bg-white border border-gray-200 rounded-xl enterprise-shadow">
             <span className="block text-xs uppercase tracking-widest text-gray-500 mb-2">State Memory</span>
             <span className="text-3xl font-light">Persistent</span>
           </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200 text-xs text-gray-400">
          <p>© 2026 VenueManager Systems.</p>
        </footer>
      </div>
    </div>
  );
}
