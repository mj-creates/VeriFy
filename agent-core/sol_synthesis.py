import json
import os
from typing import Dict, Any

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai via: pip install openai")

SYSTEM_PROMPT = """You are Sol, the Final Synthesis Agent.

**Role:** The Communicator
**Core Objective:** Take Nova's judged answer and generate a clean, empathetic, highly readable final response for the user, complete with confidence levels and reasoning.
**Input Expected:** The user's original query and Nova's final verdict JSON.
**Available Tools:** None.

**Execution Steps:**
1. Read the user's original query and Nova's final verdict JSON.
2. Draft a clear, direct answer immediately at the top of the response.
3. Assign and explicitly state a Confidence Level (High, Medium, Low) based on the `evidence_tier_used` (Official = High, News = Medium, Anecdotal = Low).
4. Create a "Source Breakdown" section that translates Nova's `conflict_analysis` into a readable format, explaining how the official, news, and public sources aligned or differed.

**Rules & Constraints (Guardrails):**
- Use Markdown styling (headers, bullet points, bold text) to make the response highly scannable and easy to read.
- Keep the tone objective but helpful and empathetic. Never sound robotic.
- Never expose the internal JSON, internal routing mechanics, or agent names (e.g., do not say "Nova judged that Vera was right"). Translate it to natural language (e.g., "Official government sources confirm...").
- Never hallucinate facts outside of what Nova provided.

**Output Schema:**
(Provide standard Markdown text, structured logically for the user, containing the Answer, Confidence Level, and Source Breakdown. Do not output JSON.)
"""

class SolSynthesisAgent:
    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        """
        Initializes the Sol Synthesis Agent.
        Defaults to using the OPENAI_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = model

    def generate_final_response(self, query: str, nova_verdict: Dict[str, Any]) -> str:
        """
        Takes the user's original query and Nova's JSON verdict,
        and returns a readable, empathetic Markdown response.
        """
        
        user_input = f"""
Original User Query: {query}

Nova's Final Verdict JSON:
{json.dumps(nova_verdict, indent=2)}
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ],
            temperature=0.4 # A bit of temperature to allow for natural, empathetic phrasing
        )
        
        return response.choices[0].message.content

# --- Example Usage ---
if __name__ == "__main__":
    try:
        agent = SolSynthesisAgent()
        
        query = "Can you bypass the new Netflix password sharing rules?"
        
        mock_nova_output = {
            "verdict": "According to official documentation, password sharing restrictions apply strictly outside the primary household network, and public rumors of bypassing it are not officially supported.",
            "evidence_tier_used": "Official",
            "conflict_analysis": "While anecdotal sources on Reddit claim VPNs or mobile hotspots can act as a workaround, official sources explicitly maintain that restrictions are enforced based on the primary household location.",
            "winning_citations": [
                "https://help.netflix.com/official",
                "https://techcrunch.com/article123"
            ]
        }
        
        print(f"[*] Sol generating final response...\n")
        markdown_result = agent.generate_final_response(query, mock_nova_output)
        
        print("=== FINAL USER RESPONSE ===\n")
        print(markdown_result)
        
    except Exception as e:
        print(f"Error running example: {e}")
