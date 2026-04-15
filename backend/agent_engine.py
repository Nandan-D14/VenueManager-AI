import uuid
from typing import Dict, Tuple

from models import AgentSession, EventDNA, ActionPlan, StaffMember
from tools.planning_tools import generate_blueprint
from tools.execution_tools import assign_task, monitor_and_reassign

class StatefulEventAgent:
    """
    Simulates Google ADK Agent that retains multi-step session memory.
    """
    def __init__(self):
        # In a real ADK app, this maps to DatabaseSessionService
        self._sessions: Dict[str, AgentSession] = {}

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = AgentSession(session_id=session_id)
        return session_id

    def inject_event_dna(self, session_id: str, dna: EventDNA, staff: list[StaffMember]) -> ActionPlan:
        session = self._sessions[session_id]
        session.event_dna = dna
        session.roster = staff
        
        # Phase 1: Planning
        plan = generate_blueprint(dna)
        session.active_plan = plan
        
        # If confident, move to deployment automatically, else request validation
        if plan.confidence_score >= 0.80:
            session.phase = "deployment"
            self._deploy_plan(session)
        else:
            session.phase = "validation"
            
        return plan

    def validate_plan(self, session_id: str, approved: bool) -> str:
        """Phase 2: Admin Validation Hook"""
        session = self._sessions[session_id]
        if approved:
            session.phase = "deployment"
            self._deploy_plan(session)
            return "Plan authorized and deployed."
        else:
            session.phase = "knowledge_acquisition"
            return "Plan rejected. Please provide more context or adjust Event DNA."

    def _deploy_plan(self, session: AgentSession):
        """Phase 3: Execution / Smart Routing"""
        if not session.active_plan:
            return
            
        for task in session.active_plan.nodes:
            if not task.dependencies:
                # Assign root tasks immediately
                assign_task(session.roster, task)

    def trigger_task_failure(self, session_id: str, task_id: str):
        session = self._sessions[session_id]
        if session.active_plan:
            for task in session.active_plan.nodes:
                if task.task_id == task_id:
                    task.status = "failed"
                    print(f"Task {task_id} failed. Calling ADK re-routing tool...")
                    monitor_and_reassign(session)

    def get_state(self, session_id: str) -> AgentSession:
        return self._sessions[session_id]

# Singleton instance for the MVP API
agent_service = StatefulEventAgent()
