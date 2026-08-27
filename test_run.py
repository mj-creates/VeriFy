import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), "agent-core"))
from orchestrator import VeriFyOrchestrator

try:
    orc = VeriFyOrchestrator()
    print("Testing pipeline with research query...")
    result = orc.process_query("Can you bypass the new Netflix password sharing rules?")
    print("Result:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
