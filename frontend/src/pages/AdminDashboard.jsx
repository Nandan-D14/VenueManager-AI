import React, { useState } from 'react';

export default function AdminDashboard() {
  const [phase, setPhase] = useState(1);
  const [plan, setPlan] = useState(null);

  const generatePlan = () => {
    setPlan({
      confidence_score: 0.72,
      clarification_requests: ["High ratio of VIPs (50+). Current model estimates 5 valets, which may cause bottlenecks. Proceed?"],
      nodes: [
        { task_id: 'SEC-01', title: 'Setup Perimeter Security', assignee: 'Unassigned', status: 'Pending' },
        { task_id: 'LOG-01', title: 'Valet Station Synchronization', assignee: 'Unassigned', status: 'Pending' },
        { task_id: 'CAT-01', title: 'Catering Inbound Logistics', assignee: 'Unassigned', status: 'Pending' }
      ]
    });
    setPhase(2);
  };

  const approvePlan = () => {
    setPhase(3);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Venue Console</h1>
            <p className="text-sm text-gray-500 mt-1">Orchestration and Logistics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-gray-600">System Nominal</span>
          </div>
        </header>

        {/* Phase 1: Planning */}
        {phase === 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 enterprise-shadow">
            <h2 className="text-lg font-medium mb-4">Event Initialization</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-2xl">
              Upload event specifications to generate a deterministic logistics plan. The AI agent will break down the venue requirements into actionable tasks for available staff.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                <div className="text-sm font-medium">Global Tech Summit 26</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expected Attendees</label>
                <div className="text-sm font-medium border-b border-gray-200 pb-1">1,250 (48 VIP)</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Venue Size</label>
                <div className="text-sm font-medium">85,000 sq ft</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={generatePlan}
                className="bg-[#111111] text-white hover:bg-black px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                Generate Blueprint
              </button>
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
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex gap-3 items-start">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong className="block mb-1 font-medium">Clarification Required</strong>
                    {plan.clarification_requests[0]}
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-900 mb-4">Proposed Task Graph</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F9FAFB] text-gray-500 font-medium border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 w-32">Task ID</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {plan.nodes.map(n => (
                        <tr key={n.task_id} className="table-row-hover">
                          <td className="py-3 px-4 font-mono text-xs text-gray-500">{n.task_id}</td>
                          <td className="py-3 px-4 font-medium">{n.title}</td>
                          <td className="py-3 px-4 text-right text-gray-500">{n.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button className="px-6 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                    Reject Plan
                  </button>
                  <button onClick={approvePlan} className="bg-[#111111] text-white hover:bg-black px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
                    Authorize & Deploy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Deployment */}
        {phase === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-3 bg-white border border-gray-200 rounded-lg p-6 enterprise-shadow">
                <h2 className="text-lg font-medium mb-6">Active Deployment</h2>
                
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-3 pr-4 font-normal">Task</th>
                      <th className="py-3 px-4 font-normal">Assignee</th>
                      <th className="py-3 pl-4 text-right font-normal">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="table-row-hover">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-gray-900">Perimeter Security</div>
                        <div className="text-xs font-mono text-gray-500 mt-1">SEC-01</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">EMP-001 (Marcus T.)</td>
                      <td className="py-4 pl-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          In Progress
                        </span>
                      </td>
                    </tr>
                    <tr className="table-row-hover">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-gray-900">Valet Station Prep</div>
                        <div className="text-xs font-mono text-gray-500 mt-1">LOG-01</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">EMP-084 (Sarah K.)</td>
                      <td className="py-4 pl-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          In Progress
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-gray-500">System Logs</h3>
                  <div className="text-xs font-mono text-gray-600 space-y-3">
                    <div className="pb-3 border-b border-gray-200">
                      [14:02:11] Plan SEC-LOG-01 deployed successfully.
                    </div>
                    <div className="pb-3 border-b border-gray-200">
                      [14:02:12] Agent routed SEC-01 to nearest idle profile (EMP-001).
                    </div>
                    <div>
                      [14:02:14] Queue holding 46 tasks.
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Efficiency Delta</span>
                  <span className="text-2xl font-light text-gray-900">+18.4%</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
