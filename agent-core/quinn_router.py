
import time
def call_llm_with_retry(client, **kwargs):
    import time
    import re
    for attempt in range(5):
        try:
            return client.chat.completions.create(**kwargs)
        except Exception as e:
            error_str = str(e)
            if "429" in error_str and "Please try again in" in error_str:
                match = re.search(r'Please try again in (?:([0-9]+)m)?([0-9.]+)s', error_str)
                if match:
                    minutes = float(match.group(1)) if match.group(1) else 0.0
                    seconds = float(match.group(2)) if match.group(2) else 0.0
                    wait_time = (minutes * 60) + seconds + 2.0
                    print(f"Rate limit hit. Waiting for {wait_time:.1f} seconds...")
                    time.sleep(wait_time)
                    continue
            print(f'LLM Error: {e}, retrying in 25s...')
            time.sleep(25)
    return client.chat.completions.create(**kwargs)

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
    def __init__(self, api_key: str = None, model: str = "openai/gpt-oss-120b"):
        """
        Initializes the Quinn Router Agent.
        Defaults to using the GROQ_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
        self.model = model

    def route_query(self, query: str) -> dict:
        """
        Takes a user's raw text query and returns a routing decision.
        """
        response = call_llm_with_retry(self.client, 
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
    # To run this example, make sure to set your GROQ_API_KEY environment variable.
    # $env:GROQ_API_KEY="your-key"
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
