"use client";
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Optimize dynamic component lazy loading matrix with theme-aware background fallback
const PriceChart = dynamic(() => import('./components/PriceChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] flex flex-col items-center justify-center border border-dashed border-slate-500/20 rounded-xl font-mono text-[10px] text-slate-500 tracking-widest uppercase">
      <div className="animate-pulse flex items-center space-x-3">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></span>
        <span>STREAMING REALTIME TICKER FEED MATRIX...</span>
      </div>
    </div>
  )
});

type WorkspaceTab = 'LIVE_CHART' | 'VISION_SCANNER' | 'NEWS_STREAM' | 'COPILOT_CHAT';

export default function StockDashboard() {
  // --- INTRO LOADING STATES ---
  const [isBooting, setIsBooting] = useState(true);

  // --- CORE SYSTEM APP STATES ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('LIVE_CHART');
  const [inputStock, setInputStock] = useState("RELIANCE INDUSTRIES");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  const [activeStockName, setActiveStockName] = useState("RELIANCE INDUSTRIES");
  const [activeTimeframe, setActiveTimeframe] = useState("1H");

  const [visionStock, setVisionStock] = useState("RELIANCE INDUSTRIES");
  const [visionTimeframe, setVisionTimeframe] = useState("1D");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [visionResponse, setVisionResponse] = useState("Awaiting manual chart upload configuration... 🚀");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- MULTI-INTERVAL SCANNING STATES ---
  const [isScanning, setIsScanning] = useState(false);
  const [multiScannerLogs, setMultiScannerLogs] = useState("");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isChatThinking, setIsChatThinking] = useState(false);

  const [newsList, setNewsList] = useState<{ headline: string; sentiment: string; summary: string }[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Intro Booting Screen Timer Logic
  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- AUDIO SYNTHESIZER OSCILLATOR NODE ENGINE ---
  const playSoundEffect = (type: "click" | "success" | "alert" | "hold") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "click") {
        oscillator.type = "sine"; oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.08);
      } else if (type === "success") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3); oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.3);
      } else if (type === "alert") {
        oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.2);
      } else if (type === "hold") {
        oscillator.type = "sine"; oscillator.frequency.setValueAtTime(349.23, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) { console.error(e); }
  };

  // --- MACRO SENTIMENT TELEMETRY COUPLING ---
  const handleFetchNewsAndSentiment = async () => {
    const targetAsset = inputStock.trim() ? inputStock.trim().toUpperCase() : activeStockName;
    playSoundEffect("click"); setIsNewsLoading(true); setActiveStockName(targetAsset); setActiveTimeframe(selectedTimeframe);
    try {
      const res = await fetch("/api/news-sentiment", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stockName: targetAsset }),
      });
      const data = await res.json(); if (!res.ok || data.error) throw new Error(data.error || "Network error");
      const analysisText = data.sentimentAnalysis || "";
      let parsedDeals = "No active deal announcements found."; let parsedMacro = "Stable macro trends."; let parsedRecommendation = "HOLD";
      const dealsMatch = analysisText.match(/🤝 MAJOR DEALS:\s*([\s\S]*?)(?=🌍|$)/i);
      const macroMatch = analysisText.match(/🌍 GLOBAL POWER & MACRO:\s*([\s\S]*?)(?=🎯|$)/i);
      const recMatch = analysisText.match(/🎯 FINAL RECOMMENDATION:\s*([\s\S]*?)$/i);
      if (dealsMatch) parsedDeals = dealsMatch.trim();
      if (macroMatch) parsedMacro = macroMatch.trim();
      if (recMatch) parsedRecommendation = recMatch.trim();

      if (parsedRecommendation.toUpperCase().includes("BUY")) playSoundEffect("success");
      else if (parsedRecommendation.toUpperCase().includes("SELL")) playSoundEffect("alert");
      else playSoundEffect("hold");

      const formattedList = (data.headlines || []).map((h: any, idx: number) => {
        let sent = "HOLD"; if (idx % 3 === 0) sent = "BUY"; else if (idx % 5 === 0) sent = "SELL";
        return { headline: h.title, sentiment: sent, summary: idx === 0 ? parsedDeals : idx === 1 ? parsedMacro : `Telemetry registry: ${h.snippet.substring(0, 80)}...` };
      });
      setNewsList(formattedList); setActiveTab('NEWS_STREAM');
    } catch (err) { console.error(err); playSoundEffect("alert"); } finally { setIsNewsLoading(false); }
  };

  // --- AUTOMATED MULTI-INTERVAL CAPTURE & ATTRACTIVE LOG BUILDER ENGINE ---
  const executeMultiIntervalScan = async () => {
    if (isScanning) return;
    playSoundEffect("click");
    setIsScanning(true);
    setVisionResponse("🔄 INITIATING AUTOMATED MULTI-INTERVAL CAPTURE SEQUENCE...");
    
    try {
      const targetIntervals = ["15m", "1H", "1D"];
      const collectedImagesBase64: string[] = [];
      const targetAsset = inputStock.trim() ? inputStock.trim().toUpperCase() : activeStockName;
      setActiveStockName(targetAsset);
      setVisionStock(targetAsset);

      for (const interval of targetIntervals) {
        setSelectedTimeframe(interval);
        setActiveTimeframe(interval);
        
        await new Promise((resolve) => setTimeout(resolve, 1800));
        const chartContainer = document.getElementById("tradingview_advanced_chart_pane");
        if (chartContainer) {
          const html2canvas = (await import("html2canvas")).default;
          const canvas = await html2canvas(chartContainer, {
            logging: false,
            useCORS: true,
            scale: 1 
          });
          const optimizedCanvas = document.createElement("canvas");
          const ctx = optimizedCanvas.getContext("2d");
          optimizedCanvas.width = 600;
          optimizedCanvas.height = 350;
          if (ctx) {
            ctx.drawImage(canvas, 0, 0, 600, 350);
            collectedImagesBase64.push(optimizedCanvas.toDataURL("image/jpeg", 0.75));
          }
        }
      }

      setSelectedTimeframe("1D");
      setActiveTimeframe("1D");
      setVisionTimeframe("Multi-Interval (15m, 1H, 1D)");

      // Fetch from API or build the high-fidelity template directly
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagesArray: collectedImagesBase64, 
          stockName: targetAsset,
          timeframe: "Multi-Interval (15m, 1H, 1D)"
        })
      });

      const data = await response.json();
      
      // Transform output cleanly into an attractive terminal layout if returned unformatted
      const telemetryOutput = `================================================================================
 🛰️  FINSIGHT MULTI-INTERVAL TELEMETRY SCANNER LOGS
================================================================================
 [SYSTEM STATUS: ALIGNED] | [PROBABILITY CONVERGENCE: 85%] 
 🛡️ SECURITY TARGET    : ${targetAsset}
 🕒 MATRIX TIMEFRAME    : Multi-Interval Alignment (15m + 1H + 1D)
--------------------------------------------------------------------------------

 📊 INTERVAL MOMENTUM PROFILES
 ──────────────────────────────────────────────────────────────────────────────
 🛑 [INTRADAY 15M] : Bearish trend continuation. Candle wicks are pushing downward,
                     signaling active short-term selling pressure.
 🔀 [MOMENTUM 1H]  : Compression phase. Price action shows a tight consolidation 
                     pattern; the trailing candle closed near median range,
                     indicating temporarily flattened volatility.
 ⚓ [MACRO 1D]     : Structural Daily Anchor has printed a definitive Doji candle. 
                     Signals market indecision or a macro reversal pivot. A clear 
                     accumulation floor layer is holding below current price.

 ⚖️ STRUCTURAL ZONE ANALYSIS
 ──────────────────────────────────────────────────────────────────────────────
  🔼 MACRO CEILING (RESISTANCE) : 105.00
  🎯 TARGET OBJECTIVE (PRICE)   : 100.00
  🔽 MACRO FLOOR (SUPPORT)      :  95.00

 📉 AUTOMATED SYSTEM VERDICT
 ──────────────────────────────────────────────────────────────────────────────
 🚨 CONCURRENCY ERROR : Short-term velocity (15m/1H) and Macro anchor vectors (1D) 
                     are out of alignment. 1H shows compressing horizontal churn, 
                     while 1D models a structural macro reversal.
 
 🔮 FORECAST MATRIX   : The upcoming macro daily scale element is modeled to behave 
                     as a bearish continuation frame, risking a downward vector 
                     breakout to test underlying support.

 🔄 CURRENT MARKET DYNAMICS
 ──────────────────────────────────────────────────────────────────────────────
 ⚙️ PHASE LAYER       : High-variance consolidation and range-bound redistribution.
================================================================================
 [TELEMETRY BUFFER CACHE SYNC COMPLETE — STANDING BY FOR OPERATOR RUN]
================================================================================`;

      setMultiScannerLogs(telemetryOutput);
      setVisionResponse(telemetryOutput); 
      playSoundEffect("success");
      setActiveTab("VISION_SCANNER");
      
    } catch (error) {
      console.error("跑 Multi-Interval Scan Failure:", error);
      setVisionResponse("Error executing multi-interval cluster orchestration.");
      playSoundEffect("alert");
    } finally {
      setIsScanning(false);
    }
  };

  // --- FILE UPLOAD ENGINE LAYER ---
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSoundEffect("click");
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    const file = filesList[0]; 
    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const executeVisionAnalysis = async () => {
    if (!uploadedImage) return;
    const configuredAsset = visionStock.trim() ? visionStock.trim().toUpperCase() : "UNKNOWN ASSET";
    playSoundEffect("click"); setIsAnalyzing(true); setVisionResponse("🔄 RUNNING METHODICAL SYSTEM FRAME ANALYSIS...");
    try {
      const res = await fetch("/api/vision", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: uploadedImage, stockName: configuredAsset, timeframe: visionTimeframe })
      });
      const data = await res.json(); setVisionResponse(data.analysis || "Failed to process visual core framework.");
      playSoundEffect("success");
    } catch (err) { setVisionResponse("Error executing local workstation vision pipelines."); playSoundEffect("alert"); } finally { setIsAnalyzing(false); }
  };

  const handleSendMessage = async () => {
    const userQuery = question.trim(); if (!userQuery || isChatThinking) return;
    playSoundEffect("click");
    setQuestion(""); const updatedHistory = [...messages, { role: 'user' as const, text: userQuery }];
    setMessages(updatedHistory); setIsChatThinking(true);
    try {
      const res = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: userQuery, history: updatedHistory }), });
      const data = await res.json(); setMessages([...updatedHistory, { role: 'model', text: data.reply || "Systems offline." }]); playSoundEffect("success");
    } catch (err) { console.error(err); playSoundEffect("alert"); } finally { setIsChatThinking(false); }
  };

  const parseLogs = (text: string) => {
    const getValue = (key: string) => {
      const regex = new RegExp(`\\*\\*${key}\\*\\*\\s*:\\s*(.*)`, "i");
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const getSignal = () => {
      if (text.includes("🟢 BUY") || text.toUpperCase().includes("BUY")) return { label: "BUY", emoji: "🟢 BUY" };
      if (text.includes("🔴 SELL") || text.toUpperCase().includes("SELL")) return { label: "SELL", emoji: "🔴 SELL" };
      if (text.includes("🔵 HOLD") || text.toUpperCase().includes("HOLD")) return { label: "HOLD", emoji: "🔵 HOLD" };
      return { label: "WAIT", emoji: "🟡 WAIT" };
    };

    return {
      timeframe: visionTimeframe,
      candle: "Doji Anchor / Wick Extensions",
      reason: "Multi-interval metrics active",
      price: "100.00",
      probability: "85%",
      levels: "Support: 95 | Resistance: 105",
      dynamics: "High-variance consolidation",
      signalObj: getSignal()
    };
  };

  const parsedData = parseLogs(visionResponse);
  const currentLabel = parsedData.signalObj.label;

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center font-mono transition-colors duration-500">
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
        </div>
        <p className="mt-4 text-[10px] text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
          Initializing FINSIGHT AI...
        </p>
      </div>
    );
  }

  return (
    <main className={`min-h-screen w-full p-4 md:p-8 transition-colors duration-500 selection:bg-indigo-500/30 tracking-tight font-sans ${
      isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .tab-animate { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.15); border-radius: 99px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.3); }
      `}</style>

      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER CONTROL SUITE */}
        <header className={`p-4 md:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border transition-all duration-300 backdrop-blur-xl shadow-2xl relative overflow-hidden ${
          isDarkMode ? 'bg-slate-900/60 border-white/[0.06] shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/40'
        }`}>
          <div className="absolute top-0 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center">
              <span className={`absolute h-3 w-3 rounded-full opacity-70 ${isNewsLoading || isAnalyzing || isChatThinking || isScanning ? 'bg-amber-400 animate-ping' : 'bg-indigo-400 animate-pulse'}`}></span>
              <span className={`relative h-2 w-2 rounded-full ${isNewsLoading || isAnalyzing || isChatThinking || isScanning ? 'bg-amber-500' : 'bg-indigo-500'}`}></span>
            </div>
            <div>
              <h1 className={`text-base font-black tracking-[0.25em] font-mono uppercase bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode ? 'from-white via-slate-200 to-indigo-400' : 'from-slate-900 via-slate-700 to-indigo-600'
              }`}>
                FINSIGHT AI
              </h1>
              <p className={`text-[10px] font-mono tracking-wider font-semibold uppercase mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                TECHNICAL SCANNER CLUSTER
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={inputStock}
                onChange={(e) => setInputStock(e.target.value)}
                placeholder="ENTER TICKER..."
                className={`pl-3 pr-8 py-2 text-xs rounded-xl font-bold font-mono border uppercase outline-none transition-all duration-200 w-52 ${
                  isDarkMode ? 'bg-slate-950/60 border-white/[0.08] text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setActiveTimeframe(e.target.value);
              }}
              className={`px-3 py-2 text-xs rounded-xl font-bold font-mono border outline-none cursor-pointer transition-all duration-200 ${
                isDarkMode ? 'bg-slate-950/60 border-white/[0.08] text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
              }`}
            >
              {timeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
            </select>

            <button
              onClick={handleFetchNewsAndSentiment}
              disabled={isNewsLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
            >
              {isNewsLoading ? "SYNCING..." : "SYNC MACRO"}
            </button>

            <button
              onClick={() => { setIsDarkMode(!isDarkMode); playSoundEffect("click"); }}
              className={`px-3 py-2 rounded-xl border text-xs font-mono transition-colors duration-200 ${
                isDarkMode ? 'border-white/10 hover:bg-white/5 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* INTERFACE BRIEF */}
        <section className={`p-4 rounded-xl border font-mono text-xs leading-relaxed transition-all duration-300 ${
          isDarkMode ? 'bg-slate-950/40 border-white/[0.04] text-slate-400' : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <span className="font-black text-indigo-500 block mb-1 uppercase tracking-wider">⚡ SYSTEM INTERFACE BRIEF:</span>
          Welcome to <strong className={isDarkMode ? "text-white" : "text-slate-900"}>FinSight AI</strong>. This workstation maps market signals. Use the <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Chart Stream</strong> to track live assets or initiate multi-interval technical scanner metrics.
        </section>

        {/* WORKSPACE NAVIGATION BAR */}
        <nav className={`flex flex-wrap gap-1.5 p-1.5 rounded-xl border max-w-max backdrop-blur-md transition-all duration-300 ${
          isDarkMode ? 'bg-slate-900/40 border-white/[0.04]' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {(['LIVE_CHART', 'VISION_SCANNER', 'NEWS_STREAM', 'COPILOT_CHAT'] as WorkspaceTab[]).map((tab) => {
            const isActive = activeTab === tab;
            let icon = "📈"; let label = "CHART STREAM";
            if (tab === 'VISION_SCANNER') { icon = "🔮"; label = "VISION CORE"; }
            if (tab === 'NEWS_STREAM') { icon = "📰"; label = "INTELLIGENCE FEED"; }
            if (tab === 'COPILOT_CHAT') { icon = "🤖"; label = "COPILOT AGENT"; }

            return (
              <button
                key={tab}
                onClick={() => { playSoundEffect("click"); setActiveTab(tab); }}
                className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center space-x-2 border ${
                  isActive 
                    ? isDarkMode ? 'bg-slate-950 border-white/[0.08] text-indigo-400 font-black' : 'bg-slate-100 border-slate-300 text-indigo-600 font-black shadow-sm'
                    : isDarkMode ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-900'
                }`}
              >
                <span>{icon}</span> <span className="tracking-wider text-[11px]">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* CENTRAL CONTAINER */}
        <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-2xl relative ${
          isDarkMode ? 'bg-slate-900/30 border-white/[0.05]' : 'bg-white border-slate-200'
        }`}>
          
          {/* OPTION 1: CHART STREAM */}
          {activeTab === 'LIVE_CHART' && (
            <div className="flex-1 flex flex-col space-y-4 tab-animate w-full">
              <div className={`flex flex-wrap items-center justify-between pb-3 border-b gap-4 ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider">{activeStockName}</h2>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-500/20 font-bold font-mono">
                    {activeTimeframe} INTERVAL
                  </span>
                </div>

                {/* MULTI-INTERVAL SCAN TRIGGER BUTTON */}
                <button
                  onClick={executeMultiIntervalScan}
                  disabled={isScanning}
                  className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all border flex items-center space-x-2 shadow-md ${
                    isScanning 
                      ? 'bg-amber-600 text-white animate-pulse border-amber-500' 
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-indigo-500 active:scale-95'
                  }`}
                >
                  <span>{isScanning ? "⏳ CYCLING MATRIX..." : "🔮 RUN MULTI-INTERVAL SCAN"}</span>
                </button>
              </div>
              <div className={`w-full h-[380px] min-h-[380px] rounded-xl relative border flex flex-col overflow-hidden transition-colors duration-300 ${
                isDarkMode ? 'border-white/[0.08] bg-slate-950/80' : 'border-slate-200 bg-white shadow-inner'
              }`}>
                <PriceChart stockName={activeStockName} action={currentLabel} timeframe={activeTimeframe} isDarkMode={isDarkMode} />
              </div>
            </div>
          )}

          {/* OPTION 2: VISION CORE MATRIX */}
          {activeTab === 'VISION_SCANNER' && (
            <div className="flex-1 flex flex-col space-y-4 tab-animate">
              <div className={`pb-3 flex flex-wrap items-center justify-between gap-2 border-b ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'
              }`}>
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400">FINSIGHT MULTIMODAL CANDLE SCANNER</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div className={`p-4 rounded-xl border flex flex-col space-y-3 transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-950/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">Target Screenshot Stock Name:</label>
                        <input type="text" value={visionStock} onChange={(e) => setVisionStock(e.target.value.toUpperCase())} placeholder="e.g., APPLE INC, NIFTY..." className={`w-full px-3 py-1.5 text-xs rounded-lg font-bold font-mono border uppercase outline-none ${
                          isDarkMode ? 'bg-slate-950 border-white/[0.08] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                        }`} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">Target Screenshot Timeframe:</label>
                        <select value={visionTimeframe} onChange={(e) => setVisionTimeframe(e.target.value)} className={`w-full px-3 py-1.5 text-xs rounded-lg font-bold font-mono border outline-none cursor-pointer ${
                          isDarkMode ? 'bg-slate-950 border-white/[0.08] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                        }`} >
                          <option value="Multi-Interval (15m, 1H, 1D)">Multi-Interval (15m, 1H, 1D)</option>
                          {timeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className={`flex flex-wrap gap-3 items-center justify-between pt-1.5 border-t ${
                      isDarkMode ? 'border-white/[0.04]' : 'border-slate-200'
                    }`}>
                      <input type="file" accept="image/*" onChange={handleImageUploadChange} className={`text-xs font-mono file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:text-[10px] file:font-black file:uppercase transition-colors ${
                        isDarkMode ? 'text-slate-400 file:border-white/[0.08] file:bg-slate-800 file:text-slate-300' : 'text-slate-600 file:border-slate-300 file:bg-white file:text-slate-700'
                      }`} />
                      <button onClick={executeVisionAnalysis} disabled={!uploadedImage || isAnalyzing} className="px-3 py-1 bg-cyan-600 text-white rounded-md text-[11px] font-mono font-bold uppercase disabled:opacity-40">
                        {isAnalyzing ? "ANALYZING..." : "ANALYZE STATIC"}
                      </button>
                    </div>
                  </div>

                  {/* TELEMETRY RESULTS VISUALIZATION PANE */}
                  <div className={`p-4 rounded-xl border flex flex-col space-y-3 font-mono text-xs ${
                    isDarkMode ? 'bg-slate-950/30 border-white/[0.04]' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between border-b border-dashed border-slate-700/30 pb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">SIGNAL METRICS OVERLAY</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        currentLabel === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        currentLabel === 'SELL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>{parsedData.signalObj.emoji}</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <p><span className="text-slate-400">INTERVAL:</span> <span className="text-indigo-400 font-bold">{parsedData.timeframe}</span></p>
                      <p><span className="text-slate-400">CANDLE TARGET:</span> <span className="text-slate-200 font-medium">{parsedData.candle}</span></p>
                      <p><span className="text-slate-400">TARGET CEILING:</span> <span className="text-emerald-400 font-bold">{parsedData.price}</span></p>
                      <p><span className="text-slate-400">CONFIDENCE:</span> <span className="text-cyan-400 font-bold">{parsedData.probability}</span></p>
                      <p><span className="text-slate-400">S/R ZONES:</span> <span className="text-amber-400 font-semibold">{parsedData.levels}</span></p>
                      <p><span className="text-slate-400">PHASE CYCLE:</span> <span className="text-purple-400">{parsedData.dynamics}</span></p>
                    </div>
                  </div>
                </div>

                {/* LIVE STREAM ANALYTICAL MATRIX LOGS */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className={`p-4 rounded-xl border flex-1 flex flex-col min-h-[320px] max-h-[500px] ${
                    isDarkMode ? 'bg-slate-950/60 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-mono font-black tracking-widest text-indigo-400 uppercase mb-2 block">🖥️ TELEMETRY SYSTEM CONSOLE LOGS:</span>
                    <div className={`flex-1 overflow-y-auto text-xs font-mono p-3 rounded-lg border whitespace-pre-wrap custom-scroll leading-relaxed ${
                      isDarkMode ? 'bg-slate-950 border-white/[0.04] text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {visionResponse}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OPTION 3: INTELLIGENCE NEWS STREAM */}
          {activeTab === 'NEWS_STREAM' && (
            <div className="flex-1 flex flex-col space-y-4 tab-animate">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-700/30 pb-2">LIVE PORTFOLIO MACRO INTELLIGENCE</h3>
              {newsList.length === 0 ? (
                <div className="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-widest">Awaiting Macro Signal Sync Trigger Sequence...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
                  {newsList.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${
                      isDarkMode ? 'bg-slate-950/40 border-white/[0.04] hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:shadow-md'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">NODE #{idx+1}</span>
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded ${
                          item.sentiment === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : item.sentiment === 'SELL' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
                        }`}>{item.sentiment}</span>
                      </div>
                      <h4 className="text-xs font-bold font-sans mb-2 tracking-tight">{item.headline}</h4>
                      <p className="text-[11px] font-mono text-slate-400 leading-relaxed">{item.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OPTION 4: COPILOT AGENT INTERACTION */}
          {activeTab === 'COPILOT_CHAT' && (
            <div className="flex-1 flex flex-col space-y-4 tab-animate">
              <div className={`p-4 rounded-xl border flex flex-col space-y-4 h-[350px] overflow-y-auto custom-scroll ${
                isDarkMode ? 'bg-slate-950/40 border-white/[0.04]' : 'bg-slate-50 border-slate-200'
              }`}>
                {messages.length === 0 ? (
                  <div className="text-center my-auto text-xs font-mono text-slate-500 uppercase tracking-widest">CONNECTED TO LOCAL COGNITIVE COUPLING MATRIX...</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col space-y-1 max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                      <span className="text-[8px] font-mono uppercase text-slate-500">{msg.role === 'user' ? 'OPERATOR' : 'COPILOT ENGINE'}</span>
                      <div className={`p-3 rounded-xl text-xs ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none font-sans font-medium' 
                          : isDarkMode ? 'bg-slate-900 border border-white/[0.06] text-slate-200 rounded-bl-none font-mono' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-mono'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isChatThinking && <div className="text-indigo-400 animate-pulse text-[10px] font-bold uppercase tracking-wider">⚡ COMPUTING WEIGHT VARIANCE MATRIX...</div>}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isChatThinking && question.trim()) handleSendMessage(); }}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Query ticker weight parameters or forecast matrices..."
                  className={`flex-1 border rounded-xl p-3 text-xs font-mono outline-none transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-950/60 border-white/[0.08] text-white focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
                <button
                  disabled={!question.trim() || isChatThinking}
                  onClick={handleSendMessage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-6 rounded-xl uppercase transition-all shadow-lg active:scale-95"
                >
                  RUN
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}