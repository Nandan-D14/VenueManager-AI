import React, { useState } from 'react';

export default function EmployeeApp() {
  const [taskStatus, setTaskStatus] = useState('active'); 

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#111111] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl enterprise-shadow overflow-hidden border border-gray-200">
        
        <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
          <span className="text-xs font-medium text-gray-500">Security Team</span>
          <span className="text-xs font-mono text-gray-400">EMP-001</span>
        </header>

        <main className="p-6">
          {taskStatus === 'active' && (
            <div className="fade-in">
              <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-wider rounded-md mb-4 border border-blue-100">
                Current Task
              </span>
              
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
                Setup Perimeter Security
              </h1>
              
              <p className="text-sm text-gray-500 mb-8">
                Main Entrance B. Ensure stanchions are evenly spaced.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setTaskStatus('completed')}
                  className="w-full bg-[#111111] text-white font-medium py-3 rounded-lg text-sm transition-colors hover:bg-black"
                >
                  Mark Complete
                </button>
                <button 
                  onClick={() => setTaskStatus('failed')}
                  className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Report Issue
                </button>
              </div>
            </div>
          )}

          {taskStatus === 'completed' && (
            <div className="fade-in text-center py-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-900">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Task Completed</h2>
              <p className="text-sm text-gray-500">Waiting for next assignment...</p>
            </div>
          )}

          {taskStatus === 'failed' && (
            <div className="fade-in text-center py-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Issue Logged</h2>
              <p className="text-sm text-gray-500">Task will be reassigned. Stand by.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
