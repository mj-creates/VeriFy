import json
import os
from typing import Optional, Literal
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai via: pip install openai pydantic")

class RouterOutput(BaseModel):
    route: Literal["DIRECT", "RESEARCH"]
    direct_answer: Optional[str] = None
    reasoning: str

SYSTEM_PROMPT = """You are Quinn, the Intake/Router Agent.

**Role:** The Gatekeeper
**Core Objective:** Analyze the incoming question and decide whether it can be answered directly (basic universal facts) or if it requires verification (claims, news, policies) and must be routed to the research pipeline.
**Input Expected:** The user's raw text query.
**Available Tools:** None.

**Execution Steps:**
1. Read and analyze the user's query carefully.
2. Determine if the query is a static, universal fact (e.g., math, standard geography) or if it is a claim, breaking news, or subjective topic requiring verification.
3. If it requires verification, set the route to "RESEARCH".
4. If it is a basic fact, set the route to "DIRECT" and provide the answer.

**Rules & Constraints (Guardrails):**
- Never guess or hallucinate answers for complex claims. Default to "RESEARCH" if there is even slight doubt.
- Do not perform actual web searches; rely purely on logic to categorize the query.
- Your output must be strictly valid JSON, with no markdown formatting blocks outside the JSON, no conversational text, and no preambles.

**Output Schema:**
{
  "route": "DIRECT" | "RESEARCH",
  "direct_answer": "Provide the answer if DIRECT, otherwise null",
  "reasoning": "Brief 1-sentence explanation of why this route was chosen"
}
"""

class QuinnRouterAgent:
    def __init__(self, api_key: str = None, model: str = "gemini-1.5-pro"):
        """
        Initializes the Quinn Router Agent.
        Defaults to using the GEMINI_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GEMINI_API_KEY"), base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
        self.model = model

    def route_query(self, query: str) -> dict:
        """
        Takes a user's raw text query and returns a routing decision.
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": query}
            ],
            response_format={"type": "json_object"},
            temperature=0.0 # Using 0 for more deterministic routing logic
        )
        
        raw_response = response.choices[0].message.content
        return json.loads(raw_response)

# --- Example Usage ---
if __name__ == "__main__":
    # To run this example, make sure to set your GEMINI_API_KEY environment variable.
    # $env:GEMINI_API_KEY="your-key"
    try:
        agent = QuinnRouterAgent()
        
        print("Testing a basic fact:")
        fact_result = agent.route_query("What is the capital of France?")
        print(json.dumps(fact_result, indent=2))
        
        print("\nTesting a claim requiring research:")
        claim_result = agent.route_query("Did the Federal Reserve raise interest rates this week?")
        print(json.dumps(claim_result, indent=2))
    except Exception as e:
        print(f"Error running example: {e}")
