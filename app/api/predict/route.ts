import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const question = body?.question;
    const history = body?.history || [];
    const chartContext = body?.chartContext || "";

    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Please provide a valid question." }, { status: 400 });
    }

    // SPEED FIX 1: Strict, brief template context instructions minimize prompt ingestion times
    const baseContextInstruction = 
      "You are 'Stock AI Copilot', an expert financial analyst engine. " +
      "Provide a clean, structured stock profile list layout using emojis. No conversational intros, no code blocks (```).\n\n" +
      "EXACT OUTPUT PATTERN:\n" +
      "[List Title Descriptive Context String]\n" +
      "🟢 1. [Stock Name] (₹[Price])\n" +
      "[Emoji] [Industry/Sector Description]\n\n" +
      "📊 Market Cap: ₹[Value] Cr\n" +
      "⚠️ Risk: [Explicit risk description]\n\n" +
      "🎯 Insight: [1-sentence forward investment insight]\n\n" +
      "⚠️ Disclaimer\n" +
      "This is an AI-generated analysis for educational use only.\n" +
      "Not financial advice. Always do your own research before investing.";

    // SPEED FIX 2: Restrict history size. Local hardware slows down exponentially when managing deep arrays
    const compressedHistory = history.slice(-2).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text
    }));

    const messages = [
      { role: "system", content: baseContextInstruction },
      ...compressedHistory,
      { role: "user", content: question }
    ];

    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3", 
        messages: messages,
        stream: false,
        options: {
          temperature: 0.0, // Strict deterministic layout parsing
          top_k: 1,
          top_p: 1.0,
          num_predict: 650, // CEILING LIMIT: Prevents slow, runaway textual generation loops
          num_ctx: 2048     // RAM SAVER: Caps total memory allocation footprint to protect VRAM allocations
        }
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama background thread failed: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    let localReply = data.message?.content || "No response text generated.";

    // Structural filter to ensure zero markdown code block leakages disrupt rendering matrix
    localReply = localReply.replace(/```[a-zA-Z]*/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ reply: localReply });

  } catch (error: any) {
    console.error("🔴 Chat Processing Exception:", error);
    return NextResponse.json(
      { error: "Internal workstation system failure.", details: error.message },
      { status: 500 }
    );
  }
}