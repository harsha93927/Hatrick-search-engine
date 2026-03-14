import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface NewsArticle {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt: string | null;
  imageUrl: string | null;
}

async function fetchNewsResults(query: string): Promise<NewsArticle[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodedQuery}&pageSize=8&sortBy=relevancy&apiKey=${process.env.NEWS_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error("News API error");
    const data = (await response.json()) as {
      articles: Array<{
        title: string;
        url: string;
        description: string;
        source: { name: string };
        publishedAt: string;
        urlToImage: string | null;
      }>;
    };
    return (data.articles || [])
      .filter((a) => a.title && a.url && a.title !== "[Removed]")
      .map((a) => ({
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
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=${encodedQuery}&max=8&apikey=${process.env.GNEWS_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error("GNews API error");
    const data = (await response.json()) as {
      articles: Array<{
        title: string;
        url: string;
        description: string;
        source: { name: string };
        publishedAt: string;
        image: string | null;
      }>;
    };
    return (data.articles || [])
      .filter((a) => a.title && a.url)
      .map((a) => ({
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

async function generateAiAnswer(query: string, results: NewsArticle[]): Promise<string> {
  try {
    const context = results
      .slice(0, 5)
      .map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful search assistant. Give a concise, factual answer (2-4 sentences) to the user's query based on the search results provided. Be direct and informative. Do not mention 'search results' or 'according to'.",
        },
        {
          role: "user",
          content: `Query: ${query}\n\nSearch Results:\n${context || "No results available"}\n\nProvide a concise answer:`,
        },
      ],
    });

    return response.choices[0]?.message?.content || `Here are the latest results for "${query}".`;
  } catch {
    return `Here are the search results for "${query}". Click any card to read more.`;
  }
}

function buildFallbackResults(query: string): NewsArticle[] {
  const topics = [
    {
      title: `Latest news about ${query}`,
      url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Stay updated with the latest news and information about ${query} from around the world.`,
      source: "Google News",
      publishedAt: new Date().toISOString(),
      imageUrl: null,
    },
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, "_"))}`,
      snippet: `Read comprehensive information about ${query} on Wikipedia, the free encyclopedia.`,
      source: "Wikipedia",
      publishedAt: null,
      imageUrl: null,
    },
    {
      title: `${query} - Search the web`,
      url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Find more results about ${query} with Bing search.`,
      source: "Bing",
      publishedAt: null,
      imageUrl: null,
    },
  ];
  return topics;
}

router.get("/search", async (req, res): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!query) {
    res.status(400).json({ error: "Missing search query" });
    return;
  }

  const [newsResults, gnewsResults] = await Promise.all([
    fetchNewsResults(query),
    fetchGNewsResults(query),
  ]);

  const seen = new Set<string>();
  const combined: NewsArticle[] = [];

  for (const item of [...newsResults, ...gnewsResults]) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      combined.push(item);
    }
  }

  const results = combined.length > 0 ? combined : buildFallbackResults(query);

  const aiAnswer = await generateAiAnswer(query, results);

  res.json({
    query,
    aiAnswer,
    results,
  });
});

export default router;
