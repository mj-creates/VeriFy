import json
import sys
import os
sys.path.append(r'd:\VeriFy\agent-core')
from dotenv import load_dotenv
load_dotenv()

from quinn_router import QuinnRouterAgent
from vera_researcher import VeraResearcherAgent
from vox_researcher import VoxResearcherAgent
from trace_researcher import TraceResearcherAgent
from nova_judge import NovaJudgeAgent
from sol_synthesis import SolSynthesisAgent
from concurrent.futures import ThreadPoolExecutor

def run_pipeline(query: str):
    print("====================================")
    print(f"Running query: {query}")
    print("====================================")
    
    model = "openai/gpt-oss-120b"
    quinn = QuinnRouterAgent(model=model)
    vera = VeraResearcherAgent(model=model)
    vox = VoxResearcherAgent(model=model)
    trace = TraceResearcherAgent(model=model)
    nova = NovaJudgeAgent(model=model)
    sol = SolSynthesisAgent(model=model)
    
    print(f"Input Question: {query}\n")
    
    try:
        route_decision = quinn.route_query(query)
        route = route_decision.get("route")
        reasoning = route_decision.get("reasoning")
        print(f"Quinn (Router) Decision: {route}, {reasoning}\n")
        
        if route == "DIRECT":
            print("Direct route, stopping.")
            return

        with ThreadPoolExecutor(max_workers=1) as executor:
            future_vera = executor.submit(vera.execute_research, query)
            future_vox = executor.submit(vox.execute_research, query)
            future_trace = executor.submit(trace.execute_research, query)
            
            vera_result = future_vera.result()
            vox_result = future_vox.result()
            trace_result = future_trace.result()
        
        def format_research(name, res):
            print(f"{name} Finding:\n")
            
            if "error" in res:
                print(f"Error: {res['error']}\n")
                return
            
            print(f"Answer: {res.get('findings', 'N/A')}")
            
            citations = res.get('citations', [])
            sources = ", ".join([c.get('url', c.get('source_name', 'Unknown')) for c in citations])
            recencies = ", ".join([str(c.get('publication_date', 'Unknown')) for c in citations])
            
            print(f"Source: {sources}")
            print(f"Recency: {recencies}\n")

        format_research("Vera (Official Source)", vera_result)
        format_research("Vox (News/Circular Source)", vox_result)
        format_research("Trace (Secondary Source)", trace_result)
        
        research_outputs = [vera_result, vox_result, trace_result]
        nova_verdict = nova.judge_research(query, research_outputs)
        
        print("Nova (Debate/Judge) Analysis:\n")
        print(f"Agreement/disagreement summary: {nova_verdict.get('conflict_analysis', 'N/A')}")
        
        sol_response = sol.generate_final_response(query, nova_verdict)
        
        print("Sol (Final Verdict) Output:\n")
        print(f"Final answer shown to user:\n{sol_response.get('markdown_response', 'N/A')}\n")
        
        final_conf = sol_response.get('confidence_score', 'N/A')
        conf_level = sol_response.get('confidence_level', 'N/A')
        print(f"Confidence: {final_conf}% ({conf_level})")
        print(f"Trust explanation: {sol_response.get('trust_explanation', 'N/A')}\n")

    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    q1 = "Am I eligible for the AICTE Pragati Scholarship for girl students, and what is the current deadline?"
    q2 = "Is there a deadline extension for the 2026 JEE Advanced exam?"
    run_pipeline(q1)
    run_pipeline(q2)
