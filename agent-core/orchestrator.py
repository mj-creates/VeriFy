import os
import json
from concurrent.futures import ThreadPoolExecutor

# Import all the core agents
from quinn_router import QuinnRouterAgent
from vera_researcher import VeraResearcherAgent
from vox_researcher import VoxResearcherAgent
from trace_researcher import TraceResearcherAgent
from nova_judge import NovaJudgeAgent
from sol_synthesis import SolSynthesisAgent

class VeriFyOrchestrator:
    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        """
        Initializes the entire VeriFy pipeline and connects all sub-agents.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is missing. Please set it.")
            
        self.model = model
        
        print("[System] Initializing VeriFy Agent Core...")
        
        # Instantiate the pipeline
        self.quinn = QuinnRouterAgent(api_key=self.api_key, model=self.model)
        self.vera = VeraResearcherAgent(api_key=self.api_key, model=self.model)
        self.vox = VoxResearcherAgent(api_key=self.api_key, model=self.model)
        self.trace = TraceResearcherAgent(api_key=self.api_key, model=self.model)
        self.nova = NovaJudgeAgent(api_key=self.api_key, model=self.model)
        self.sol = SolSynthesisAgent(api_key=self.api_key, model=self.model)
        
        print("[System] All Agents Successfully Connected and Ready.\n")

    def process_query(self, query: str) -> str:
        """
        The main pipeline execution:
        Router -> [Research (Vera, Vox, Trace)] -> Judge (Nova) -> Synthesize (Sol)
        """
        print(f"\n--- Processing New Query: '{query}' ---")
        
        # 1. Routing Phase
        print("[Quinn] Analyzing query to determine routing...")
        route_decision = self.quinn.route_query(query)
        
        if route_decision.get("route") == "DIRECT":
            print(f"[Quinn] Route: DIRECT. Reason: {route_decision.get('reasoning')}")
            direct_answer = route_decision.get("direct_answer", "No direct answer provided.")
            # For direct facts, we bypass the research pipeline entirely.
            return f"**Direct Answer:**\n\n{direct_answer}"
            
        print(f"[Quinn] Route: RESEARCH. Reason: {route_decision.get('reasoning')}")
        
        # 2. Parallel Research Phase
        print("\n[System] Dispatching Research Agents Concurrently...")
        research_outputs = []
        
        # Execute the three researchers at the same time using a ThreadPool
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_vera = executor.submit(self.vera.execute_research, query)
            future_vox = executor.submit(self.vox.execute_research, query)
            future_trace = executor.submit(self.trace.execute_research, query)
            
            # Await and collect results
            vera_result = future_vera.result()
            vox_result = future_vox.result()
            trace_result = future_trace.result()
            
            research_outputs = [vera_result, vox_result, trace_result]
            
        print("[System] Research Phase Complete.")
        
        # 3. Judging Phase
        print("\n[Nova] Analyzing evidence hierarchy and formulating verdict...")
        nova_verdict = self.nova.judge_research(query, research_outputs)
        
        # 4. Final Synthesis Phase
        print("\n[Sol] Synthesizing final response for the user...")
        final_markdown = self.sol.generate_final_response(query, nova_verdict)
        
        return final_markdown

# --- CLI Entry Point ---
if __name__ == "__main__":
    import sys
    
    if not os.getenv("OPENAI_API_KEY"):
        print("CRITICAL: OPENAI_API_KEY environment variable is not set.")
        print("Windows PowerShell: $env:OPENAI_API_KEY='sk-yourkey'")
        print("Mac/Linux: export OPENAI_API_KEY='sk-yourkey'")
        sys.exit(1)
        
    try:
        orchestrator = VeriFyOrchestrator()
    except Exception as e:
        print(f"Failed to initialize orchestrator: {e}")
        sys.exit(1)
    
    print("="*60)
    print("Welcome to the VeriFy Agent Core CLI.")
    print("Ask any question or submit a claim to be verified.")
    print("Type 'exit' or 'quit' to close the application.")
    print("="*60)
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.strip().lower() in ['exit', 'quit']:
                print("Shutting down VeriFy...")
                break
                
            if not user_input.strip():
                continue
                
            final_response = orchestrator.process_query(user_input)
            
            print("\n" + "="*60)
            print("VERIFY FINAL RESPONSE:")
            print("="*60)
            print(final_response)
            print("="*60)
            
        except KeyboardInterrupt:
            print("\nShutting down VeriFy...")
            break
        except Exception as e:
            print(f"\n[Error] Pipeline failed during execution: {e}")
