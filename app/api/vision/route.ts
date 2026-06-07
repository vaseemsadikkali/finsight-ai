import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imagesArray, stockName, timeframe } = await req.json();

    if (!imagesArray || !Array.isArray(imagesArray) || imagesArray.length === 0) {
      return NextResponse.json({ error: "Missing or invalid multi-image chart array sequence." }, { status: 400 });
    }

    // Clean and sanitize all captured elements in the collection array
    const structuredImagesPayload = imagesArray.map((base64String: string) => {
      let cleanStr = base64String;
      if (base64String.includes(",")) {
        cleanStr = base64String.split(",")[1];
      }
      return cleanStr.replace(/\s/g, "");
    });

    // Highly comprehensive multi-frame analytical comparative system instructions
    const matrixMultiPrompt = `
      You are FinSight AI, a senior multi-timeframe market technician. 
      Analyze the array of 3 candlestick charts provided for "${stockName}" loaded across distinct trend horizons.

      SEQUENCE CONFIGURATION MAP:
      - IMAGE 1: 15-Minute Intraday Trajectory
      - IMAGE 2: 1-Hour Short-Term Momentum Horizon
      - IMAGE 3: 1-Day Macro Structural Anchor

      CRITICAL MULTI-INTERVAL SCANNING RULES:
      1. MATRIX CONCURRENCY: Check for trend alignment across horizons. Is the short-term momentum (15m/1H) confirming or rejecting macro Daily structural layers?
      2. PRICE SCALE GROUNDING: Look strictly at the vertical scales printed on the right side of the charts. Your output price coordinates MUST be accurate and proportional to those lines. Never guess out-of-bounds metrics (like 750 or 100).
      3. OUTPUT STRIP SYSTEM: Deliver your final metrics using EXACTLY the key-value structures below. Do NOT use markdown code blocks (\`\`\`) or asterisk bolding lines.

      Follow this layout format structure:

      [METRICS START]
      TIMEFRAME_PROFILE: Multi-Interval Alignment (15m + 1H + 1D)
      STOCK_NAME: ${stockName}
      INTRADAY_15M_TREND: [State direction and setup of the 15-minute candle wicks]
      MOMENTUM_1H_TREND: [State direction and structure of the 1-hour candle setups]
      MACRO_1D_ANCHOR: [Identify primary daily reference candle and floor layer]
      CONCURRENCY_VERDICT: [1-sentence statement confirming if timeframes align or diverge]
      PREDICTED_UPCOMING_CANDLE: [State color and structural pattern expected next on macro daily scale]
      PREDICTED_PRICE: [Target level mapped cleanly to visible right axis scale values]
      PROBABILITY_SCORE: [State confidence score percentage, e.g., 85%]
      SUPPORT_LEVEL: [State exact macro floor read from right price scale]
      RESISTANCE_LEVEL: [State exact macro ceiling read from right price scale]
      MARKET_DYNAMICS: [State Aggressive Uptrend, Distribution, Capitulation, or Range Consolidation]
      [METRICS END]

      ---

      [SIGNAL START]
      MARKET_SIGNAL: [Output exactly one keyword string: BUY, SELL, HOLD, or WAIT]
      [SIGNAL END]
    `;

    // Connect and stream all three image sequences concurrently into Ollama engine framework ports
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llava",
        prompt: matrixMultiPrompt,
        images: structuredImagesPayload, // Sends all 3 timeframe snapshots to the model at once!
        stream: false,
        options: {
          temperature: 0.0, // Retain locked-down deterministic structural reliability
          top_k: 1,
          top_p: 1.0,
          num_predict: 400
        }
      }),
    });

    if (!ollamaResponse.ok) {
      return NextResponse.json({ error: `Local vision engine matrix stream rejected parameter payload` }, { status: 500 });
    }

    const data = await ollamaResponse.json();
    return NextResponse.json({ analysis: data.response });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "System framework matrix compilation processing failure" }, { status: 500 });
  }
}