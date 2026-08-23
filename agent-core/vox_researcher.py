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

SYSTEM_PROMPT = """You are Vox, the News and Current Events Researcher Agent.

**Role:** The Journalist
**Core Objective:** Independently investigate the query using recent news outlets, press releases, and industry circulars to establish timelines and journalistic consensus.
**Input Expected:** The user's original query and a "RESEARCH" trigger from the Router.
**Available Tools:** browser, search

**Execution Steps:**
1. Formulate search queries targeting major, reputable news publications and press wires.
2. Execute searches filtering for recent dates (especially if the claim is time-sensitive).
3. Cross-reference at least two major news sources to verify the narrative.
4. Extract the latest developments, timelines, and the general media consensus.

**Rules & Constraints (Guardrails):**
- Prioritize recency. If a claim changed recently, you must capture the most up-to-date information.
- If news sources conflict with each other, summarize the conflict. Do not pick a side.
- Never cite forums, Reddit, or unverified social media accounts.

**Output Schema:**
{
  "agent_name": "Vox",
  "findings": "Summary of the journalistic consensus and recent events...",
  "citations": [
    {"source_name": "Publication Name", "url": "...", "publication_date": "YYYY-MM-DD"}
  ],
  "data_found": true | false
}
"""

from tools import search, browser

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Execute a web search query for recent news articles, press releases, and industry circulars.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query to execute"}
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "browser",
            "description": "Read the content of a specific news webpage by providing its URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "The URL of the news webpage to read"}
                },
                "required": ["url"],
            },
        },
    }
]

class VoxResearcherAgent:
    def __init__(self, api_key: str = None, model: str = "gemini-1.5-pro"):
        """
        Initializes the Vox News Researcher Agent.
        Defaults to using the GEMINI_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("GEMINI_API_KEY"), base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
        self.model = model

    def execute_research(self, query: str, max_steps: int = 5) -> dict:
        """
        Executes a reasoning loop allowing Vox to search news and read articles before concluding.
        """
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Please investigate this query using news sources: {query}"}
        ]

        print(f"[*] Vox starting investigation for: {query}")
        
        # ReAct / Tool-Calling Loop
        for step in range(max_steps):
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.3 # Slightly higher temperature for qualitative journalistic synthesis
            )

            response_message = response.choices[0].message
            messages.append(response_message)

            if response_message.tool_calls:
                for tool_call in response_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    if function_name == "search":
                        tool_result = search(function_args.get("query"))
                    elif function_name == "browser":
                        tool_result = browser(function_args.get("url"))
                    else:
                        tool_result = "Error: Unknown tool."

                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": tool_result,
                        }
                    )
            else:
                # No more tools called, time to generate the final JSON output
                print("[*] Investigation complete, generating journalistic summary...")
                final_prompt = "You have completed your investigation. Please output your final findings strictly in the required JSON schema."
                messages.append({"role": "user", "content": final_prompt})
                
                final_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.0
                )
                
                raw_response = final_response.choices[0].message.content
                return json.loads(raw_response)
        
        return {"error": "Maximum research steps reached without completion."}

# --- Example Usage ---
if __name__ == "__main__":
    try:
        agent = VoxResearcherAgent()
        
        result = agent.execute_research("What is the latest update on the SpaceX Starship launch?")
        
        print("\n=== FINAL RESULT ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error running example: {e}")
