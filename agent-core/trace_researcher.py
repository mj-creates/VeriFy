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
    publication_date: Optional[str] = None # Optional for Trace since forum posts might lack precise dates

class TraceOutput(BaseModel):
    agent_name: str = "Trace"
    findings: str
    citations: List[Citation]
    data_found: bool

SYSTEM_PROMPT = """You are Trace, the Secondary Source Researcher Agent.

**Role:** The Pulse Reader
**Core Objective:** Scan forums, community aggregators, and social sentiment to find edge cases, unofficial workarounds, public opinion, and anecdotal claims.
**Input Expected:** The user's original query and a "RESEARCH" trigger from the Router.
**Available Tools:** browser, search

**Execution Steps:**
1. Formulate search queries using operators like "site:reddit.com", "site:quora.com", or targeted forum domains.
2. Analyze community discussions, upvoted comments, and social media threads related to the claim.
3. Identify what the general public is saying, feeling, or experiencing regarding the topic.
4. Explicitly identify any widespread rumors, misconceptions, or "hacky" workarounds being shared.

**Rules & Constraints (Guardrails):**
- You are documenting the *conversation*, not the absolute truth.
- You must clearly label anecdotal evidence as anecdotal.
- If you find a viral rumor, document exactly what the rumor is without validating it as fact.

**Output Schema:**
{
  "agent_name": "Trace",
  "findings": "Summary of public sentiment, anecdotal claims, or rumors...",
  "citations": [
    {"source_name": "Platform/Forum Name", "url": "..."}
  ],
  "data_found": true | false
}
"""

# --- Dummy Tool Implementations ---
# In a real environment, you might use Reddit API (PRAW), Apify, or specific search APIs
def search(query: str) -> str:
    """Executes a web search query focused on forums and social media."""
    print(f"  [Tool: search] Executing community search for: '{query}'")
    # Simulated response
    return f"Search results for {query}: [Link 1: https://www.reddit.com/r/example/comments/1234, Title: Megathread on the topic]"

def browser(url: str) -> str:
    """Reads the content of a forum or social media thread."""
    print(f"  [Tool: browser] Reading community thread from: '{url}'")
    # Simulated response
    return f"Content of {url}: Users are discussing anecdotal workarounds. The top comment with 5k upvotes states they found a hacky solution, but a rumor is spreading that it might get patched."

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Execute a web search query tailored for community forums (e.g., using site:reddit.com).",
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
            "description": "Read the content of a specific forum post or social media thread by providing its URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "The URL of the webpage to read"}
                },
                "required": ["url"],
            },
        },
    }
]

class TraceResearcherAgent:
    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        """
        Initializes the Trace Secondary Source Agent.
        Defaults to using the OPENAI_API_KEY environment variable if no key is provided.
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = model

    def execute_research(self, query: str, max_steps: int = 5) -> dict:
        """
        Executes a reasoning loop allowing Trace to scan forums and read threads before concluding.
        """
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Please scan the community pulse regarding this query: {query}"}
        ]

        print(f"[*] Trace starting sentiment scan for: {query}")
        
        # ReAct / Tool-Calling Loop
        for step in range(max_steps):
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                temperature=0.4 # Slightly higher to capture colloquial language and broader sentiment
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
                # No more tools called, generate the final JSON output
                print("[*] Scan complete, generating sentiment report...")
                final_prompt = "You have completed your scan. Please output your final findings strictly in the required JSON schema."
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
        agent = TraceResearcherAgent()
        
        result = agent.execute_research("How are users bypassing the new Netflix password sharing restrictions?")
        
        print("\n=== FINAL RESULT ===")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"Error running example: {e}")
