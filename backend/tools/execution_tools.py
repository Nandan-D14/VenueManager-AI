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
    Simulates checking for failed tasks and reassigning them.
    In real life this would be triggered by a timeout or explicit staff failure.
    """
    if not session.active_plan or not session.roster:
        return
        
    for task in session.active_plan.nodes:
        if task.status == "failed":
            print(f"Agent detected failed task: {task.task_id}. Re-routing...")
            # Release old assignee
            if task.assigned_to:
                for staff in session.roster:
                    if staff.employee_id == task.assigned_to:
                        staff.status = "idle"
                        staff.current_task_id = None
            
            # Reassign
            task.assigned_to = None
            task.status = "pending"
            assigned_id = assign_task(session.roster, task)
            if not assigned_id:
                print(f"CRITICAL WARNING: No available staff to handle {task.task_id}")
