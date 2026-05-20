import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt: string | null;
  imageUrl: string | null;
}

// Function to fetch from real API if keys are present
async function fetchNewsResults(query: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodedQuery}&pageSize=8&sortBy=relevancy&apiKey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return [];
    const data = (await response.json()) as any;
    return (data.articles || [])
      .filter((a: any) => a.title && a.url && a.title !== "[Removed]")
      .map((a: any) => ({
        title: a.title,
        url: a.url,
        snippet: a.description || "",
        source: a.source?.name || "News",
        publishedAt: a.publishedAt || null,
        imageUrl: a.urlToImage || null,
      }));
  } catch {
    return [];
  }
}

async function fetchGNewsResults(query: string): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodedQuery}&max=8&apikey=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return [];
    const data = (await response.json()) as any;
    return (data.articles || [])
      .filter((a: any) => a.title && a.url)
      .map((a: any) => ({
        title: a.title,
        url: a.url,
        snippet: a.description || "",
        source: a.source?.name || "GNews",
        publishedAt: a.publishedAt || null,
        imageUrl: a.image || null,
      }));
  } catch {
    return [];
  }
}

// Improved Fallback that provides a "Search-like" experience using public sites
function buildEnhancedFallback(query: string): NewsArticle[] {
  const now = new Date();
  const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const sources = [
    {
      name: "Google News",
      base: "https://news.google.com/search?q=",
      domain: "news.google.com",
      img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800" // News collage
    },
    {
      name: "Wikipedia",
      base: "https://en.wikipedia.org/wiki/",
      domain: "wikipedia.org",
      img: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800" // Books/Library
    },
    {
      name: "TechCrunch",
      base: "https://techcrunch.com/search/",
      domain: "techcrunch.com",
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" // Technology
    },
    {
      name: "The Verge",
      base: "https://www.theverge.com/search?q=",
      domain: "theverge.com",
      img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800" // Gadgets
    },
    {
      name: "BBC News",
      base: "https://www.bbc.co.uk/search?q=",
      domain: "bbc.com",
      img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=800" // World news
    },
    {
      name: "Reuters",
      base: "https://www.reuters.com/search/news?blob=",
      domain: "reuters.com",
      img: "https://images.unsplash.com/photo-1585829365294-118bd972410a?auto=format&fit=crop&q=80&w=800" // Global business
    }
  ];

  return sources.map((s, i) => {
    // Generate a slightly more specific image using a themed search
    const topicKeywords = query.split(' ').slice(0, 2).join(',');
    const themedImg = `https://images.unsplash.com/featured/?${encodeURIComponent(topicKeywords)},${encodeURIComponent(s.name.toLowerCase())}`;
    
    return {
      title: `${query} | Latest Updates & Comprehensive Insights from ${s.name}`,
      url: `${s.base}${encodeURIComponent(query)}`,
      snippet: `Explore the most recent developments, detailed analytical reports, and expert commentary about "${query}" on ${s.name}. Stay updated with real-time information shared by trusted sources globally.`,
      source: s.name,
      publishedAt: timestamp,
      imageUrl: themedImg
    };
  });
}

async function generateGeminiAnswer(query: string, results: NewsArticle[], apiKey: string, modelName: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-2.0-flash" });

    const context = results
      .slice(0, 5)
      .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}`)
      .join("\n");

    const prompt = `You are JARVIS, a sophisticated search engine intelligence.
    Provide a premium, insightful, and comprehensive summary of the search results for the user's query.
    Be authoritative yet accessible. Use markdown for better presentation.

    CRITICAL: If the user is asking to perform an OS operation, respond ONLY with a structured JSON object.
    Supported Intents:
    - {"intent": "open_app", "target": "App Name"}
    - {"intent": "open_folder", "path": "Folder Path"}
    - {"intent": "create_file", "path": "path/to/file.txt", "content": "file content"}
    - {"intent": "delete_file", "path": "path/to/file"}
    - {"intent": "rename_file", "path": "old_path", "new_name": "new_name"}
    - {"intent": "list_dir", "path": "folder_path"}
    - {"intent": "search_file", "query": "filename"}
    - {"intent": "screenshot"}
    - {"intent": "get_system_info"}
    - {"intent": "get_processes"}
    - {"intent": "kill_process", "target": "PID or Name"}
    - {"intent": "set_brightness", "params": {"level": 50}}

    If it's not an OS operation, provide a natural language response as JARVIS.

    Query: ${query}

    Key Findings from Web Search:
    ${context}

    Synthesize an intelligent response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini AI Generation Error:", err);
    throw err;
  }
}

async function generateAiAnswer(query: string, results: NewsArticle[]): Promise<string> {
  try {
    const context = results
      .slice(0, 4)
      .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are JARVIS, a sophisticated search engine intelligence. Provide a premium, insightful, and comprehensive summary of the search results for the user's query. Be authoritative yet accessible. Use markdown for better presentation. CRITICAL: If the user is asking to perform an OS operation (open app, open folder, search files, take screenshot), respond ONLY with a structured JSON object like: {\"intent\": \"open_app\", \"target\": \"App Name\"}.",
        },
        {
          role: "user",
          content: `Query: ${query}\n\nKey Findings:\n${context}\n\nSynthesize an intelligent response:`,
        },
      ],
    });

    return response.choices[0]?.message?.content || `Analyzed the latest streams for "${query}". Here is the synthesis of information across major global sources.`;
  } catch (err) {
    console.error("AI Generation Error:", err);
    return `Results for **${query}** have been aggregated from top global sources including Google News, Wikipedia, and premium news outlets. Browse the cards below to explore detailed insights and saved items for later viewing.`;
  }
}

router.get("/search", async (req, res): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const geminiKey = req.headers["x-gemini-key"] as string;
  const geminiModel = req.headers["x-gemini-model"] as string;

  if (!query) {
    res.status(400).json({ error: "Search query is required" });
    return;
  }

  // Use real APIs if available, otherwise use our enhanced fallback
  const newsResults = await fetchNewsResults(query);
  const gnewsResults = await fetchGNewsResults(query);

  const combined = [...newsResults, ...gnewsResults];
  const finalResults = combined.length > 0 ? combined : buildEnhancedFallback(query);

  let aiAnswer: string;
  if (geminiKey) {
    try {
      aiAnswer = await generateGeminiAnswer(query, finalResults, geminiKey, geminiModel);
    } catch (err) {
      console.warn("Falling back to default AI due to Gemini error");
      aiAnswer = await generateAiAnswer(query, finalResults);
    }
  } else {
    aiAnswer = await generateAiAnswer(query, finalResults);
  }

  res.json({
    query,
    aiAnswer,
    results: finalResults,
  });
});

export default router;
