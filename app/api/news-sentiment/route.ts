import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    let stockName = body?.stockName;

    if (!stockName || stockName.trim() === "") {
      return NextResponse.json({ error: "No target asset provided." }, { status: 400 });
    }

    // Clean up asset string from any common spaces to avoid breaking Google Search RSS feeds
    const cleanStockQuery = stockName.trim().replace(/\s+/g, " ");
    const encodedStock = encodeURIComponent(`${cleanStockQuery} stock news`);
    
    const feedUrl = `https://news.google.com/rss/search?q=${encodedStock}&hl=en-US&gl=US&ceid=US:en`;
    
    // Fetch live feed from parser
    const feed = await parser.parseURL(feedUrl).catch((err) => {
      console.error("Parser extraction error:", err);
      return null;
    });

    if (!feed || !feed.items || feed.items.length === 0) {
      return NextResponse.json({
        sentimentAnalysis: "⚠️ No recent live news nodes located for this specific asset ticker.",
        headlines: []
      });
    }

    // Grab the top 8 most recent live headlines
    const topHeadlines = feed.items.slice(0, 8).map(item => ({
      title: item.title || "No headline title text available",
      snippet: item.contentSnippet || item.title || "",
      date: item.pubDate || ""
    }));

    // Format headlines into a text block for the local Ollama AI engine
    const newsTextBlock = topHeadlines.map((h, idx) => `[${idx + 1}] ${h.title}`).join("\n");

    // Connect to your local offline workstation runtime port
    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3", 
        messages: [
          {
            role: "user",
            content: `Analyze these live news headlines for "${cleanStockQuery}":\n\n${newsTextBlock}\n\n` +
                     `CRITICAL RULE: Output ONLY the requested format blocks. Do not add intro or concluding chit-chat. Do not wrap the code blocks or response fields in markdown backticks (\`\`\`). Follow the template tags exactly.\n\n` +
                     `🤝 MAJOR DEALS: [Analyze partnerships, acquisitions, or contracts mentioned. If none, write 'No active deal announcements found.']\n` +
                     `🌍 GLOBAL POWER & MACRO: [Analyze how global politics, interest rates, regulations, or macro trends impact this specific stock right now]\n` +
                     `🎯 FINAL RECOMMENDATION: [State either 'STRONGLY RECOMMEND BUY', 'WEAK BUY', 'HOLD', or 'SELL' in all caps based purely on these news headlines] because [Give a 1-sentence reason]`
          }
        ],
        stream: false,
        options: {
          temperature: 0.0, // Ensures deterministic sentiment analysis scores on matching headlines
          top_k: 1,         // Drops sampling variation to lock structural stability
          top_p: 1.0
        }
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama connection error: ${ollamaResponse.statusText}`);
    }

    const aiData = await ollamaResponse.json();
    const analysisResult = aiData.message?.content || "Failed to generate market sentiment analysis matrix.";

    return NextResponse.json({
      sentimentAnalysis: analysisResult,
      headlines: topHeadlines
    });

  } catch (error: any) {
    console.error("🔴 Sentiment Processing Node Exception Handler:", error);
    return NextResponse.json(
      { error: "Failed to generate live news intelligence matrix.", details: error.message },
      { status: 500 }
    );
  }
}