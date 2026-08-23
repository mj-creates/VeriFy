import os
import requests

def search(query: str, max_results: int = 3) -> str:
    """Executes a web search query using the Tavily API."""
    print(f"  [Real Tool: search] Executing Tavily search for: '{query}'")
    
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY environment variable is missing. Please set it."
        
    try:
        response = requests.post(
            "https://api.tavily.com/search",
            json={
                "api_key": api_key,
                "query": query,
                "search_depth": "basic",
                "include_answer": False,
                "max_results": max_results
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        results = data.get("results", [])
        if not results:
            return f"No search results found for '{query}'."
            
        formatted_results = []
        for i, res in enumerate(results):
            formatted_results.append(
                f"Result {i+1}:\nTitle: {res.get('title')}\nLink: {res.get('url')}\nSnippet: {res.get('content')}\n"
            )
            
        return "\n".join(formatted_results)
    except Exception as e:
        return f"Tavily Search failed: {str(e)}"

def browser(url: str) -> str:
    """Reads a webpage and extracts clean Markdown using Jina AI Reader."""
    print(f"  [Real Tool: browser] Reading webpage via Jina AI: '{url}'")
    try:
        # Jina AI Reader works simply by prepending https://r.jina.ai/ to any URL
        jina_url = f"https://r.jina.ai/{url}"
        
        headers = {
            # Optional: Jina allows sending an API key if you have one, 
            # but it works great for free tiers without it.
            "Accept": "text/plain" 
        }
        
        response = requests.get(jina_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        text = response.text
        
        # Truncate text to avoid blowing up the LLM context window
        max_chars = 8000
        if len(text) > max_chars:
            text = text[:max_chars] + "\n... [Content Truncated due to length]"
            
        return text
    except Exception as e:
        return f"Failed to read webpage {url} via Jina AI: {str(e)}"
