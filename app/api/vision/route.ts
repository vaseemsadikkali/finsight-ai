import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, stockName, timeframe } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No chart image provided" }, { status: 400 });
    }

    let cleanBase64 = imageBase64;
    if (imageBase64.includes(",")) {
      cleanBase64 = imageBase64.split(",")[1];
    }
    cleanBase64 = cleanBase64.replace(/\s/g, ""); 

    const analyticalPrompt = `
      You are FinSight AI, a premier institutional-grade market technician. Analyze the chart screenshot for "${stockName}" on the "${timeframe}" interval.
      
      Extract precise candle metrics from right-to-left and deliver your report using EXACTLY the markdown labels below. Do not print any conversational padding before or after.

      Use this exact template layout:

      ### 📊 FINSIGHT ANALYSIS LOG
      
      * **TIMEFRAME ANALYZED**: ${timeframe}
      * **CANDLE TARGETED**: [Identify the most relevant recent candle structure]
      * **REASON**: [Explain the price action physics, e.g., wick rejections or institutional block orders, in simple English]
      * **PREDICTED PRICE**: [Provide a logical near-term price ceiling or target level based on chart geometry]
      * **PROBABILITY**: [Provide an estimated percentage confidence level, e.g., 75%, matching the pattern's reliability]
      * **KEY LEVELS**: [State one visible technical Support and one Resistance ceiling level]
      * **MARKET DYNAMICS**: [State whether the asset is in an Aggressive Uptrend, Distribution, Capitulation, or Range Consolidation]
      
      ---
      
      ### 🚨 MARKET SIGNAL
      [Output exactly one of these string keywords in bold uppercase: **BUY**, **SELL**, **HOLD**, or **WAIT**]
    `;

    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llava",
        prompt: analyticalPrompt,
        images: [cleanBase64],
        stream: false,
        options: {
          temperature: 0.1
        }
      }),
    });

    if (!ollamaResponse.ok) {
      return NextResponse.json({ error: `Local engine rejected connection parameters` }, { status: 500 });
    }

    const data = await ollamaResponse.json();
    return NextResponse.json({ analysis: data.response });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "System processing framework failure" }, { status: 500 });
  }
}