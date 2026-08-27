import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), "agent-core"))
load_dotenv()

from nova_judge import NovaJudgeAgent
import json

try:
    agent = NovaJudgeAgent()
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
    import traceback
    traceback.print_exc()
