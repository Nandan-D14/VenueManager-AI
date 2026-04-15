import os
from pathlib import Path
from google import genai
from typing import List
from dotenv import load_dotenv

from models import EventDNA, ActionPlan, TaskNode

# Load .env from the parent backend/ directory (works from any working directory)
_env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=_env_path)

# Initialize the Gemini GenAI client
# GEMINI_API_KEY is loaded from backend/.env by dotenv above
_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    client = genai.Client(api_key=_api_key)
    print(f"Agent Engine: Gemini client initialized. Key ending in ...{_api_key[-6:]}")
else:
    print("Warning: GEMINI_API_KEY not found in .env. Falling back to simulation mode.")
    client = None

def generate_blueprint(dna: EventDNA) -> ActionPlan:
    """
    Uses the real Gemini API to parse Event DNA and generate a deterministic
    Hierarchical Task Tree (ActionPlan) leveraging Structured Outputs.
    """
    if not client:
        # Fallback to simulation if no API key is configured
        print("Agent Engine: No API key found. Falling back to simulated plan.")
        return _simulate_blueprint(dna)

    print(f"Agent Engine: Sending Event DNA to Gemini (Event: {dna.event_type}, Guests: {dna.guest_count})...")
    
    prompt = f"""
    You are an expert Venue Manager AI and Logistics Orchestrator.
    Generate a Master Execution Plan based on the following Event DNA:
    
    - Event Type: {dna.event_type}
    - Venue Size: {dna.venue_size_sqft} sqft
    - Guest Count: {dna.guest_count} total, {dna.vip_count} VIPs
    - Special Requirements: {dna.special_requirements}
    
    INSTRUCTIONS:
    1. Break down the operational logistics into distinct tasks (e.g. Security, Catering, Valet).
    2. Suggest realistic estimated durations in minutes and specific roles required for each task.
    3. If there are obvious resource bottlenecks (e.g. too many VIPs for standard valet wait times), 
       lower your confidence score (0.0 to 1.0) and output a clarification request to the Admin.
    4. Provide dependencies between tasks (e.g., Catering Prep must happen after Security Perimeter).
    """

    try:
        # We request a structured response matching our Pydantic ActionPlan model
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': ActionPlan,
                'temperature': 0.2, # Low temperature for deterministic planning
            },
        )
        
        # The SDK automatically returns the text as a validated JSON string matching the schema if we parse it
        import json
        plan_dict = json.loads(response.text)
        return ActionPlan(**plan_dict)

    except Exception as e:
        print(f"Agent Engine Error: Gemini request failed: {e}")
        return _simulate_blueprint(dna)

def _simulate_blueprint(dna: EventDNA) -> ActionPlan:
    """Original mockup fallback"""
    tasks = [
        TaskNode(
            task_id="sec-01",
            title="Setup Perimeter Security",
            description="Deploy security barrier at main entrance.",
            required_role="Security",
            estimated_duration_mins=45
        ),
        TaskNode(
            task_id="log-01",
            title="Valet Station Prep",
            description="Prepare keys tracking board and cones.",
            required_role="Valet",
            estimated_duration_mins=30,
            dependencies=["sec-01"]
        )
    ]
    return ActionPlan(
        confidence_score=0.75 if dna.vip_count > 50 else 0.95,
        nodes=tasks,
        clarification_requests=["High ratio of VIPs. Are 5 valets sufficient?"] if dna.vip_count > 50 else []
    )
