import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeApp from './pages/EmployeeApp';
import GuestPortal from './pages/GuestPortal';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route 
          path="/admin" 
          element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/employee" 
          element={<ProtectedRoute allowedRoles={['admin', 'employee']}><EmployeeApp /></ProtectedRoute>} 
        />
        <Route 
          path="/guest" 
          element={<ProtectedRoute allowedRoles={['admin', 'employee', 'guest']}><GuestPortal /></ProtectedRoute>} 
        />
      </Routes>
    </Router>
  );
}

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/login');
  };

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
          <div className="flex gap-4 text-sm font-medium items-center">
            {token ? (
              <>
                {(role === 'admin' || role === 'employee' || role === 'guest') && (
                  <Link to="/guest" className="text-gray-500 hover:text-black transition-colors px-2 py-1">Guest Portal</Link>
                )}
                {(role === 'admin' || role === 'employee') && (
                  <Link to="/employee" className="text-gray-500 hover:text-black transition-colors px-2 py-1">Staff App</Link>
                )}
                {role === 'admin' && (
                  <Link to="/admin" className="bg-[#111111] text-white hover:bg-black transition-colors px-4 py-1.5 rounded-md">Admin Console</Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors text-xs ml-2"
                >
                  Logout ({user})
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-gray-500 hover:text-black transition-colors px-2 py-1.5">Login</Link>
                <Link to="/register" className="bg-[#111111] text-white hover:bg-black transition-colors px-4 py-1.5 rounded-md">Register</Link>
              </div>
            )}
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
            {token ? (
              <Link to="/admin" className="bg-[#111111] text-white hover:bg-black transition-colors px-6 py-3 rounded-lg font-medium">
                Initialize Console
              </Link>
            ) : (
              <Link to="/login" className="bg-[#111111] text-white hover:bg-black transition-colors px-6 py-3 rounded-lg font-medium">
                Get Started
              </Link>
            )}
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
