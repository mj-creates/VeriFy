
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
3. Calculate a Numeric Confidence Score using this formula:
   - Base Score: Official = 80, News = 60, Anecdotal = 40 (based on `evidence_tier_used`).
   - Consistency Bonus: Add +15 if Nova's `conflict_analysis` indicates all sources agree (Consensus).
   - Cap the maximum final score at 99.
4. Determine the Confidence Level (High, Medium, or Low).
5. Write a one-line Trust Explanation summarizing why this confidence level was assigned based on the sources.
6. Create a "Source Breakdown" section in markdown that translates Nova's `conflict_analysis` into a readable format, explaining how the official, news, and public sources aligned or differed. Include the formula breakdown for the confidence score here.

**Rules & Constraints (Guardrails):**
- Use Markdown styling (headers, bullet points, bold text) in the `markdown_response` field to make it highly scannable and easy to read.
- Keep the tone objective but helpful and empathetic. Never sound robotic.
- Never expose the internal JSON, internal routing mechanics, or agent names (e.g., do not say "Nova judged that Vera was right"). Translate it to natural language (e.g., "Official government sources confirm...").
- Never hallucinate facts outside of what Nova provided.
- **You must strictly output valid JSON according to the schema.**

**Output Schema:**
{
  "markdown_response": "The complete markdown formatted response containing the Answer, Confidence Level explanation, and Source Breakdown.",
  "confidence_score": 95,
  "confidence_level": "High" | "Medium" | "Low",
  "trust_explanation": "One line explaining the trust based on sources."
}
"""

class SolSynthesisAgent:
    def __init__(self, api_key: str = None, model: str = "llama-3.1-8b-instant"):
        """
        Initializes the Sol Synthesis Agent.
        Defaults to using the GROQ_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")
        self.model = model

    def generate_final_response(self, query: str, nova_verdict: Dict[str, Any]) -> dict:
        """
        Takes the user's original query and Nova's JSON verdict,
        and returns a JSON dictionary with the response and confidence metrics.
        """
        
        user_input = f"""
Original User Query: {query}

Nova's Final Verdict JSON:
{json.dumps(nova_verdict, indent=2)}
"""

        response = call_llm_with_retry(self.client, 
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ],
            response_format={"type": "json_object"},
            temperature=0.4 # A bit of temperature to allow for natural, empathetic phrasing
        )
        
        raw_response = response.choices[0].message.content
        return json.loads(raw_response)

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
