from pydantic import BaseModel, Field
from typing import List, Optional, Dict

# Role definitions
class StaffMember(BaseModel):
    employee_id: str
    name: str
    role: str
    experience_level: int = Field(..., description="1-10 scale")
    status: str = "idle" # idle, working, offline
    current_task_id: Optional[str] = None

class EventDNA(BaseModel):
    event_type: str
    venue_size_sqft: int
    guest_count: int
    vip_count: int
    special_requirements: str

# Task definitions
class TaskNode(BaseModel):
    task_id: str
    title: str
    description: str
    required_role: str
    estimated_duration_mins: int
    status: str = "pending" # pending, in-progress, completed, failed
    dependencies: List[str] = []
    assigned_to: Optional[str] = None

class ActionPlan(BaseModel):
    confidence_score: float
    nodes: List[TaskNode]
    clarification_requests: List[str] = []
    
class AgentSession(BaseModel):
    session_id: str
    event_dna: Optional[EventDNA] = None
    roster: List[StaffMember] = []
    active_plan: Optional[ActionPlan] = None
    phase: str = "knowledge_acquisition" # knowledge_acquisition, validation, deployment
