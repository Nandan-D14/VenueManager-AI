import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionId, adminChat, validateBlueprint, getState } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1);
  const [plan, setPlan] = useState(null);
  const [roster, setRoster] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to the Venue Master Planner. Please describe your event (e.g. Type, Size, Guests, VIPs). You may also upload a 2D map for spatial context.' }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const id = await getSessionId();
        const state = await getState(id);
        setSession(id);
        
        if (state.roster) setRoster(state.roster);
        if (state.phase === 'deployment') {
          setPhase(3);
          setPlan(state.active_plan);
        } else if (state.phase === 'validation' && state.active_plan) {
          setPhase(2);
          setPlan(state.active_plan);
        } else if (state.admin_chat_history && state.admin_chat_history.length > 0) {
          setMessages([
            { role: 'ai', text: 'Welcome to the Venue Master Planner. Please describe your event (e.g. Type, Size, Guests, VIPs). You may also upload a 2D map for spatial context.' },
            ...state.admin_chat_history
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    initSession();
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!session) return;
    
    const ws = new WebSocket(`ws://localhost:8000/api/ws/${session}`);
    
    ws.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data);
        if (state.active_plan) {
          setPlan(state.active_plan);
        }
        if (state.roster) {
          setRoster(state.roster);
        }
        if (state.phase === 'deployment') {
          setPhase(3);
        } else if (state.phase === 'validation' && state.active_plan) {
          setPhase(2);
        }
      } catch (err) {
        console.error("Invalid WS payload", err);
      }
    };

    return () => ws.close();
  }, [session]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitChat = async (textToSubmit, imageBase64ToSubmit) => {
    if (!textToSubmit.trim() && !imageBase64ToSubmit) return;
    if (!session) return;
    
    setMessages(prev => [...prev, { role: 'user', text: textToSubmit, hasImage: !!imageBase64ToSubmit }]);
    
    setInput('');
    clearImage();
    setLoading(true);
    
    try {
      const res = await adminChat(session, textToSubmit, imageBase64ToSubmit);
      if (res.reply) {
        setMessages(prev => [...prev, { role: 'ai', text: res.reply, suggestedOptions: res.suggested_options }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "System Error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    submitChat(input, imageBase64);
  };

  const handleOptionClick = (opt) => {
    submitChat(opt, '');
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleApprovePlan = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await validateBlueprint(session, true);
      // Let WebSocket handle state transitions
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculation
  const totalTasks = plan?.nodes?.length || 0;
  const completedTasks = plan?.nodes?.filter(t => t.status === 'completed').length || 0;
  const failedTasks = plan?.nodes?.filter(t => t.status === 'failed').length || 0;
  const pendingTasks = totalTasks - completedTasks - failedTasks;
  const availableStaff = roster?.filter(s => s.status === 'idle').length || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
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
        
        <header className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">System Control Room</h1>
            <p className="text-sm text-gray-500 mt-1">Global AI Orchestration</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${session ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-600">{session ? 'Uplink Nominal' : 'Connecting...'}</span>
          </div>
        </header>

        {/* Phase 1: Interactive Chatbot Planning */}
        {phase === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg enterprise-shadow flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 bg-[#FAFAFA] rounded-t-lg">
              <h2 className="text-lg font-medium">Event Initialization Hook</h2>
              <p className="text-sm text-gray-500">Provide details directly to the Venue AI. Once enough data is structured, the AI will generate a plan autonomously.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 max-w-[80%] text-sm rounded-lg whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-[#111111] text-white' : 'bg-[#F4F4F5] text-gray-800'
                  }`}>
                    {m.hasImage && (
                      <div className="mb-2 text-xs italic opacity-75">📎 [Image Uploaded]</div>
                    )}
                    {m.text}
                  </div>
                  {m.role === 'ai' && m.suggestedOptions && m.suggestedOptions.length > 0 && i === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {m.suggestedOptions.map((opt, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleOptionClick(opt)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs hover:bg-gray-50 text-gray-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-[#F4F4F5] rounded-lg text-sm text-gray-500 italic">
                    AI is analyzing...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white rounded-b-lg">
              {image && (
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded overflow-hidden border border-gray-200">
                    <img src={imageBase64} alt="Upload preview" className="h-full w-full object-cover" />
                  </div>
                  <button onClick={clearImage} className="text-xs text-red-500 hover:text-red-700">Remove Map</button>
                </div>
              )}
              <form onSubmit={handleSendChat} className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                  title="Upload 2D Map"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your event or attach a map..."
                  className="flex-1 border border-gray-300 rounded-md px-4 text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading || (!input.trim() && !image)}
                  className="bg-[#111111] text-white px-5 rounded-md text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Phase 2: Validation */}
        {phase === 2 && plan && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg enterprise-shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#F9FAFB] rounded-t-lg">
                <h2 className="text-lg font-medium">Plan Validation</h2>
                <span className="text-sm px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                  Confidence: {(plan.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              <div className="p-6">
                {plan.clarification_requests && plan.clarification_requests.length > 0 && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex gap-3 items-start">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <strong className="block mb-1 font-medium">Warning Flagged</strong>
                      {plan.clarification_requests[0]}
                    </div>
                  </div>
                )}

                <h3 className="text-sm font-medium text-gray-900 mb-4">Proposed Task Graph</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F9FAFB] text-gray-500 font-medium border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 w-32">Task ID</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plan.nodes && plan.nodes.map(n => (
                         <tr key={n.task_id} className="table-row-hover">
                          <td className="py-3 px-4 font-mono text-xs text-gray-500">{n.task_id}</td>
                          <td className="py-3 px-4 font-medium">{n.title}</td>
                          <td className="py-3 px-4 text-gray-500">{n.required_role}</td>
                          <td className="py-3 px-4 text-right text-gray-500">{n.estimated_duration_mins}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setPhase(1)} className="px-6 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    Reject Plan
                  </button>
                  <button 
                    onClick={handleApprovePlan}
                    disabled={loading}
                    className="bg-[#111111] text-white hover:bg-black px-6 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    Authorize Deployment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Deployment / Control Room */}
        {phase === 3 && plan && (
          <div className="space-y-6">
            
            {/* Top Telemetry Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5 enterprise-shadow">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Tasks</div>
                <div className="text-2xl font-semibold text-gray-900">{totalTasks}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 enterprise-shadow">
                <div className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">Completed</div>
                <div className="text-2xl font-semibold text-emerald-600">{completedTasks}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 enterprise-shadow">
                <div className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1">Pending</div>
                <div className="text-2xl font-semibold text-amber-600">{pendingTasks}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-5 enterprise-shadow">
                <div className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">Failures</div>
                <div className="text-2xl font-semibold text-red-600">{failedTasks}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              
              {/* Left Column: Live Tasks */}
              <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6 enterprise-shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">Task Matrix</h2>
                  <span className="text-xs text-gray-400 font-mono">LIVE UPDATE</span>
                </div>
                
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-3 pr-4 font-normal">Task</th>
                      <th className="py-3 px-4 font-normal">Assignee</th>
                      <th className="py-3 pl-4 text-right font-normal">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plan.nodes && plan.nodes.map(n => (
                      <tr key={n.task_id} className="table-row-hover">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-gray-900">{n.title}</div>
                          <div className="text-xs font-mono text-gray-500 mt-1">{n.task_id}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{n.assigned_to || 'Unassigned'}</td>
                        <td className="py-4 pl-4 text-right">
                          {n.status === 'in-progress' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              In Progress
                            </span>
                          ) : n.status === 'failed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                              {n.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Column: Staff Roster */}
              <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-6 enterprise-shadow flex flex-col h-full">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-sm font-medium">Crew Roster</h3>
                  <span className="text-xs text-emerald-600 font-medium">{availableStaff} Available</span>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {roster.map(staff => (
                    <div key={staff.employee_id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{staff.name}</div>
                        <div className="text-xs text-gray-500">{staff.role}</div>
                      </div>
                      <div>
                        {staff.status === 'idle' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Working
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                   <div className="text-xs text-gray-400 font-mono text-center flex items-center justify-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     LIVE SYNC
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
