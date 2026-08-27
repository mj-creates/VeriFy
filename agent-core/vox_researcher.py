
import time
def call_llm_with_retry(client, **kwargs):
    for attempt in range(3):
        try:
            return client.chat.completions.create(**kwargs)
        except Exception as e:
            print(f'LLM Error: {e}, retrying in 25s...')
            time.sleep(25)
    return client.chat.completions.create(**kwargs)

import json
import os
from typing import List, Optional
from pydantic import BaseModel

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai via: pip install openai pydantic")

# --- Schemas ---
class Citation(BaseModel):
    source_name: str
    url: str
    publication_date: Optional[str] = None

class VoxOutput(BaseModel):
    agent_name: str = "Vox"
    findings: str
    citations: List[Citation]
    data_found: bool

SYSTEM_PROMPT = """You are Vox, the Base Knowledge LLM Agent.

**Role:** The Base Knowledge Expert
**Core Objective:** Retrieve answers to the query purely from your own base knowledge without using any external tools or browsing. Provide a fast, general understanding or factual summary.
**Input Expected:** The user's original query and a "RESEARCH" trigger from the Router.
**Available Tools:** None.

**Execution Steps:**
1. Analyze the user's query.
2. Retrieve the most accurate and general factual answer based purely on your pre-trained knowledge.
3. Summarize your internal knowledge into a concise finding.

**Rules & Constraints (Guardrails):**
- You MUST NOT attempt to use any tools, search the web, or browse.
- Provide a fast, accurate summary based solely on what you already know.
- If you do not know the answer, explicitly state that it is beyond your base knowledge.
- Since you are not browsing, your citations should simply list "LLM Base Knowledge".

**Output Schema:**
{
  "agent_name": "Vox",
  "findings": "Summary of your internal knowledge regarding the claim...",
  "citations": [
    {"source_name": "LLM Base Knowledge", "url": "N/A", "publication_date": "N/A"}
  ],
  "data_found": true | false
}
"""

class VoxResearcherAgent:
    def __init__(self, api_key: str = None, model: str = "llama-3.1-8b-instant"):
        """
        Initializes the Vox News Researcher Agent.
        Defaults to using the GROQ_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
        self.model = model

    def execute_research(self, query: str, max_steps: int = 3) -> dict:
        """
        Executes a reasoning loop allowing Vox to search news and read articles before concluding.
        """
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Please investigate this query using news sources: {query}"}
        ]

        print(f"[*] Vox retrieving base knowledge for: {query}")
        
        # Single LLM Call to get the final JSON directly
        final_prompt = "Please output your final findings strictly in the required JSON schema based on your internal knowledge."
        messages.append({"role": "user", "content": final_prompt})

        final_response = call_llm_with_retry(self.client,
            model=self.model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        raw_response = final_response.choices[0].message.content
        return json.loads(raw_response)

# --- Example Usage ---
if __name__ == "__main__":
    try:
        agent = VoxResearcherAgent()
        
        result = agent.execute_research("What is the latest update on the SpaceX Starship launch?")
        
        print("\n=== FINAL RESULT ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error running example: {e}")
