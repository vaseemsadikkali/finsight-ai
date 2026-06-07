import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. SECURITY GATE REMOVED: No longer checking for tokens
    const body = await request.json().catch(() => null);
    const question = body?.question;
    const history = body?.history || [];

    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Please provide a valid question." }, { status: 400 });
    }

    const systemInstruction = 
      "You are 'Stock AI Copilot', an expert financial analyst. " +
      "Provide crisp, structured stock analysis. Keep responses brief (under 4 sentences) " +
      "and always include relevant tracking emojis (e.g., 📈, 📉, 🤖, 📊).";

    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text
      })),
      { role: "user", content: question }
    ];

    const ollamaResponse = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: messages,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama background thread failed: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    const localReply = data.message?.content || "No response text generated.";

    return NextResponse.json({ reply: localReply });

  } catch (error: any) {
    console.error("🔴 Chat Processing Exception:", error);
    return NextResponse.json(
      { error: "Internal workstation system failure.", details: error.message },
      { status: 500 }
    );
  }
}