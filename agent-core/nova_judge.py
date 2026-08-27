
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
from typing import List, Literal, Dict, Any
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai via: pip install openai pydantic")

# --- Schemas ---
class NovaOutput(BaseModel):
    verdict: str
    evidence_tier_used: Literal["Official", "News", "Anecdotal"]
    conflict_analysis: str
    winning_citations: List[str]

SYSTEM_PROMPT = """You are Nova, the Debate and Consensus Judge Agent.

**Role:** The Arbitrator
**Core Objective:** Compare the research outputs from Vera, Vox, and Trace, apply a strict source hierarchy, flag conflicts, and select the most reliable answer.
**Input Expected:** A JSON array containing the complete outputs from Vera, Vox, and Trace.
**Available Tools:** None.

**Execution Steps:**
1. Read and digest the JSON outputs provided by Vera, Vox, and Trace.
2. Compare their findings against the original claim.
3. Apply the Strict Hierarchy of Evidence: Vera (Official) overrides Vox (News); Vox overrides Trace (Anecdotal).
4. Identify if all three sources agree (Consensus), or where they diverge (Conflict).
5. Formulate a final judged ruling based on the highest tier of available evidence.

**Rules & Constraints (Guardrails):**
- If Vera states X, and Trace states Y, Vera wins automatically. You must explain that the public rumor is disproven by official policy.
- Do not conduct new research or hallucinate data. You must only judge the data provided to you in the input JSON.
- Your output must be strictly valid JSON, with no markdown formatting blocks outside the JSON, no conversational text, and no preambles.

**Output Schema:**
{
  "verdict": "The definitive, judged truth in 2-3 sentences",
  "evidence_tier_used": "Official" | "News" | "Anecdotal",
  "conflict_analysis": "Brief explanation of how the sources agreed or disagreed",
  "winning_citations": ["url1", "url2"]
}
"""

class NovaJudgeAgent:
    def __init__(self, api_key: str = None, model: str = "openai/gpt-oss-120b"):
        """
        Initializes the Nova Judge Agent.
        Defaults to using the GROQ_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
        self.model = model

    def judge_research(self, claim: str, research_outputs: List[Dict[str, Any]]) -> dict:
        """
        Takes the original claim and a JSON array containing the outputs from Vera, Vox, and Trace,
        and returns a final judged verdict.
        """
        
        # Package the inputs clearly for Nova to analyze
        user_input = json.dumps({
            "original_claim": claim,
            "research_outputs": research_outputs
        }, indent=2)

        response = call_llm_with_retry(self.client, 
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"},
            temperature=0.2 # Nova needs to be highly deterministic and strict
        )
        
        raw_response = response.choices[0].message.content
        if raw_response.startswith("```json"):
            raw_response = raw_response[7:]
        if raw_response.startswith("```"):
            raw_response = raw_response[3:]
        if raw_response.endswith("```"):
            raw_response = raw_response[:-3]
        raw_response = raw_response.strip()
        return json.loads(raw_response)

# --- Example Usage ---
if __name__ == "__main__":
    try:
        agent = NovaJudgeAgent()
        
        # Mock inputs from the other agents
        mock_vera_output = {
            "agent_name": "Vera",
            "findings": "Official documentation indicates that password sharing restrictions apply strictly outside the primary household network.",
            "citations": [{"source_name": "Official Help Center", "url": "https://help.netflix.com/official", "publication_date": "2023-10-01"}],
            "data_found": True
        }
        
        mock_vox_output = {
            "agent_name": "Vox",
            "findings": "Recent articles report Netflix is rolling out its password sharing crackdown globally.",
            "citations": [{"source_name": "TechCrunch", "url": "https://techcrunch.com/article123", "publication_date": "2023-10-05"}],
            "data_found": True
        }
        
        mock_trace_output = {
            "agent_name": "Trace",
            "findings": "Users on Reddit claim they can bypass the restriction by logging in via a VPN or mobile hotspot once a month.",
            "citations": [{"source_name": "Reddit", "url": "https://reddit.com/r/netflix/comments/bypass"}],
            "data_found": True
        }
        
        claim = "Can you bypass the new Netflix password sharing rules?"
        research_outputs = [mock_vera_output, mock_vox_output, mock_trace_output]
        
        print(f"[*] Nova judging the claim: '{claim}'\n")
        result = agent.judge_research(claim, research_outputs)
        
        print("=== FINAL VERDICT ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error running example: {e}")
