import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionId, getState, failTask } from '../utils/api';

export default function EmployeeApp() {
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState('idle');
  const [activeTask, setActiveTask] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const EMPLOYEE_ID = 'EMP-001';

  // Make sure we have a session ID
  useEffect(() => {
    getSessionId().then(setSession).catch(console.error);
  }, []);

  // Connect to WebSocket for real-time assignments
  useEffect(() => {
    if (!session) return;
    
    const ws = new WebSocket(`ws://localhost:8000/api/ws/${session}`);
    
    ws.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data);
        if (state.roster && state.active_plan && state.active_plan.nodes) {
          const me = state.roster.find(s => s.employee_id === EMPLOYEE_ID);
          if (me && me.current_task_id) {
            const task = state.active_plan.nodes.find(t => t.task_id === me.current_task_id);
            if (task && task.status === 'in-progress') {
              setActiveTask(task);
              setTaskStatus('active');
            } else {
              setTaskStatus(prev => (prev !== 'failed' && prev !== 'completed' ? 'idle' : prev));
            }
          } else {
            setTaskStatus(prev => (prev !== 'failed' && prev !== 'completed' ? 'idle' : prev));
          }
        }
      } catch (err) {
        console.error("Invalid WS payload", err);
      }
    };
    
    return () => ws.close();
  }, [session]);

  const handleMarkComplete = () => {
    setTaskStatus('completed');
    setActiveTask(null);
    // Real implementation would hit a backend /tasks/complete endpoint
  };

  const handleReportIssue = async () => {
    if (!session || !activeTask) return;
    setLoading(true);
    try {
      await failTask(session, activeTask.task_id);
      setTaskStatus('failed');
      setActiveTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#111111] font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm mb-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl enterprise-shadow overflow-hidden border border-gray-200">
        
        <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
          <span className="text-xs font-medium text-gray-500">Security Team</span>
          <span className="text-xs font-mono text-gray-400">{EMPLOYEE_ID}</span>
        </header>

        <main className="p-6">
          {taskStatus === 'idle' && (
            <div className="fade-in text-center py-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-900 border border-gray-200">
                <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Standby Mode</h2>
              <p className="text-sm text-gray-500">You have no active task. Waiting for central command routing...</p>
            </div>
          )}

          {taskStatus === 'active' && activeTask && (
            <div className="fade-in">
              <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-wider rounded-md mb-4 border border-blue-100">
                Current Task ({activeTask.task_id})
              </span>
              
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
                {activeTask.title}
              </h1>
              
              <p className="text-sm text-gray-500 mb-8">
                {activeTask.description}
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleMarkComplete}
                  className="w-full bg-[#111111] text-white font-medium py-3 rounded-lg text-sm transition-colors hover:bg-black"
                >
                  Mark Complete
                </button>
                <button 
                  onClick={handleReportIssue}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 text-red-600 font-medium py-3 rounded-lg text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Reporting...' : 'Report Issue'}
                </button>
              </div>
            </div>
          )}

          {taskStatus === 'completed' && (
            <div className="fade-in text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Task Completed</h2>
              <p className="text-sm text-gray-500">Waiting for next assignment...</p>
              <button 
                  onClick={() => setTaskStatus('idle')}
                  className="mt-6 text-xs text-gray-500 hover:text-gray-900 underline"
              >
                  Return to Standby
              </button>
            </div>
          )}

          {taskStatus === 'failed' && (
            <div className="fade-in text-center py-6">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-1">Issue Logged</h2>
              <p className="text-sm text-gray-500">Task has been failed and will be rerouted. Stand by.</p>
              <button 
                  onClick={() => setTaskStatus('idle')}
                  className="mt-6 text-xs text-gray-500 hover:text-gray-900 underline"
              >
                  Acknowledge
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
