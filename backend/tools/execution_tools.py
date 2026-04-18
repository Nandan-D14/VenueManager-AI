from typing import List, Optional
from models import StaffMember, TaskNode, AgentSession

def assign_task(roster: List[StaffMember], task: TaskNode) -> Optional[str]:
    """
    Finds the best idle employee for a specific task role.
    """
    candidates = [
        staff for staff in roster
        if staff.role == task.required_role and staff.status == "idle"
    ]
    
    if not candidates:
        return None
        
    # Sort by experience level descending
    candidates.sort(key=lambda x: x.experience_level, reverse=True)
    best_candidate = candidates[0]
    
    # Assign
    best_candidate.status = "working"
    best_candidate.current_task_id = task.task_id
    task.assigned_to = best_candidate.employee_id
    task.status = "in-progress"
    
    print(f"Smart Routing: Assigned {task.task_id} to {best_candidate.name} (Exp: {best_candidate.experience_level})")
    return best_candidate.employee_id

def monitor_and_reassign(session: AgentSession):
    """
    Uses Gemini to evaluate failures and look at available staff to generate a new task assignment.
    """
    if not session.active_plan or not session.roster:
        return
        
    for task in session.active_plan.nodes:
        if task.status == "failed":
            print(f"Agent detected failed task: {task.task_id}. Triggering ADK LLM evaluation...")
            # Release old assignee
            if task.assigned_to:
                for staff in session.roster:
                    if staff.employee_id == task.assigned_to:
                        staff.status = "idle"
                        staff.current_task_id = None
            
            # Use Gemini to intelligently re-route if available
            from tools.planning_tools import client
            import json

            if client:
                prompt = (
                    f"Task Failure Detected: {task.title} (ID: {task.task_id}).\n"
                    f"Original Description: {task.description}\n\n"
                    "Available Staff (idle):\n"
                )
                idle_staff = [s for s in session.roster if s.status == "idle"]
                for s in idle_staff:
                    prompt += f"- ID: {s.employee_id}, Name: {s.name}, Role: {s.role}, Exp: {s.experience_level}\n"
                
                prompt += (
                    "Re-evaluate the task requirements and pick the best available staff member to handle the failure.\n"
                    "Output a strictly formatted JSON object: {\"employee_id\": \"<chosen_id>\", \"updated_title\": \"<new title>\"}.\n"
                    "If no one is available, output {\"employee_id\": null, \"updated_title\": \"Emergency: Needs Attention\"}"
                )

                try:
                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt,
                        config={'response_mime_type': 'application/json'}
                    )
                    decision = json.loads(response.text)
                    chosen_id = decision.get("employee_id")
                    
                    task.title = decision.get("updated_title", task.title)
                    task.status = "pending"
                    task.assigned_to = None

                    if chosen_id:
                        for st in idle_staff:
                            if st.employee_id == chosen_id:
                                st.status = "working"
                                st.current_task_id = task.task_id
                                task.assigned_to = st.employee_id
                                task.status = "in-progress"
                                print(f"AI Re-routed {task.task_id} to {st.name}")
                                break
                    else:
                        print(f"CRITICAL WARNING: AI found no staff for {task.task_id}")
                    return # Handled this task
                except Exception as e:
                    print(f"AI Re-route failed: {e}. Falling back to default routing.")

            # Fallback
            task.assigned_to = None
            task.status = "pending"
            assigned_id = assign_task(session.roster, task)
            if not assigned_id:
                print(f"CRITICAL WARNING: No available staff to handle {task.task_id}")
