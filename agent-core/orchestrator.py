import os
from dotenv import load_dotenv
load_dotenv()
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
    def __init__(self, api_key: str = None, model: str = "openai/gpt-oss-120b"):
        """
        Initializes the entire VeriFy pipeline and connects all sub-agents.
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is missing. Please set it.")
            
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

    def process_query(self, query: str) -> dict:
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
            # Return a dummy VerifyResult structure for consistency
            return {
                "question": query,
                "findings": [
                    {"agentName": "Vera", "sourceTier": "official", "answer": "Direct factual query. No research needed.", "sourceUrl": "N/A", "recency": "N/A"},
                    {"agentName": "Vox", "sourceTier": "news", "answer": "Direct factual query. No research needed.", "sourceUrl": "N/A", "recency": "N/A"},
                    {"agentName": "Trace", "sourceTier": "anecdotal", "answer": "Direct factual query. No research needed.", "sourceUrl": "N/A", "recency": "N/A"}
                ],
                "judgment": {
                    "agreementSummary": route_decision.get("reasoning", "Direct answer provided."),
                    "confidenceScore": 99,
                    "breakdown": {"baseScore": 99, "consistencyBonus": 0},
                    "selectedAnswer": direct_answer,
                    "needsHumanReview": False
                },
                "finalAnswer": direct_answer,
                "trustExplanation": "Direct factual answer from base model knowledge."
            }
            
        print(f"[Quinn] Route: RESEARCH. Reason: {route_decision.get('reasoning')}")
        
        # 2. Parallel Research Phase
        print("\n[System] Dispatching Research Agents Sequentially...")
        research_outputs = []
        
        # Execute the three researchers sequentially to avoid LLM rate limits
        vera_result = self.vera.execute_research(query)
        vox_result = self.vox.execute_research(query)
        trace_result = self.trace.execute_research(query)
        
        research_outputs = [vera_result, vox_result, trace_result]
            
        print("[System] Research Phase Complete.")
        
        # 3. Judging Phase
        print("\n[Nova] Analyzing evidence hierarchy and formulating verdict...")
        nova_verdict = self.nova.judge_research(query, research_outputs)
        
        # 4. Final Synthesis Phase
        print("\n[Sol] Synthesizing final response for the user...")
        sol_response = self.sol.generate_final_response(query, nova_verdict)
        
        # Construct findings
        def map_finding(agent_name, tier, result):
            answer = result.get("findings", "No findings.")
            citations = result.get("citations", [])
            url = citations[0].get("url", "unknown") if citations else "unknown"
            recency = citations[0].get("publication_date", "Unknown") if citations else "Unknown"
            return {
                "agentName": agent_name,
                "sourceTier": tier,
                "answer": answer,
                "sourceUrl": url,
                "recency": recency
            }
            
        findings = [
            map_finding("Vera", "official", vera_result),
            map_finding("Vox", "news", vox_result),
            map_finding("Trace", "anecdotal", trace_result)
        ]
        
        base_score = 80 if nova_verdict.get("evidence_tier_used") == "Official" else (60 if nova_verdict.get("evidence_tier_used") == "News" else 40)
        confidence = sol_response.get("confidence_score", 0)
        consistency_bonus = max(0, confidence - base_score)
        
        judgment = {
            "agreementSummary": nova_verdict.get("conflict_analysis", ""),
            "confidenceScore": confidence,
            "breakdown": {
                "baseScore": base_score,
                "consistencyBonus": consistency_bonus
            },
            "selectedAnswer": nova_verdict.get("verdict", ""),
            "needsHumanReview": confidence < 50
        }
        
        return {
            "question": query,
            "findings": findings,
            "judgment": judgment,
            "finalAnswer": sol_response.get("markdown_response", ""),
            "trustExplanation": sol_response.get("trust_explanation", "")
        }

# --- CLI Entry Point ---
if __name__ == "__main__":
    import sys
    
    if not os.getenv("GROQ_API_KEY"):
        print("CRITICAL: GROQ_API_KEY environment variable is not set.")
        print("Windows PowerShell: $env:GROQ_API_KEY='sk-yourkey'")
        print("Mac/Linux: export GROQ_API_KEY='sk-yourkey'")
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
