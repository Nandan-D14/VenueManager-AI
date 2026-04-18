import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  // Don't show complex nav on the home page as it has its own hero nav, 
  // but we'll provide a consistent one for sub-pages.
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-5 h-5 bg-[#111111] rounded-sm flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">V</span>
        </div>
        <span className="font-semibold tracking-tight text-sm text-gray-900">VenueManager</span>
      </Link>
      
      <div className="flex gap-4 text-xs font-medium">
        <Link 
          to="/guest" 
          className={`px-3 py-1.5 rounded-md transition-colors ${location.pathname === '/guest' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`}
        >
          Guest Portal
        </Link>
        <Link 
          to="/employee" 
          className={`px-3 py-1.5 rounded-md transition-colors ${location.pathname === '/employee' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`}
        >
          Staff App
        </Link>
        <Link 
          to="/admin" 
          className={`px-3 py-1.5 rounded-md transition-colors ${location.pathname === '/admin' ? 'bg-[#111111] text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          Admin Console
        </Link>
      </div>
    </nav>
  );
}
