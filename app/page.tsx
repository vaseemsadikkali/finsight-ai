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
      if (dealsMatch) parsedDeals = dealsMatch[1].trim();
      if (macroMatch) parsedMacro = macroMatch[1].trim();
      if (recMatch) parsedRecommendation = recMatch[1].trim();

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

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSoundEffect("click"); const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onloadend = () => setUploadedImage(reader.result as string);
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
      if (/\*\*BUY\*\*/i.test(text) || text.toUpperCase().includes("BUY")) return { label: "BUY", emoji: "🟢 BUY" };
      if (/\*\*SELL\*\*/i.test(text) || text.toUpperCase().includes("SELL")) return { label: "SELL", emoji: "🔴 SELL" };
      if (/\*\*HOLD\*\*/i.test(text) || text.toUpperCase().includes("HOLD")) return { label: "HOLD", emoji: "🔵 HOLD" };
      if (/\*\*WAIT\*\*/i.test(text) || text.toUpperCase().includes("WAIT")) return { label: "WAIT", emoji: "🟡 WAIT" };
      return { label: "WAIT", emoji: "🟡 WAIT" };
    };

    return {
      timeframe: getValue("TIMEFRAME ANALYZED") || visionTimeframe,
      candle: getValue("CANDLE TARGETED") || "Detecting edge frames...",
      reason: getValue("REASON") || "Awaiting scan execution payload sequence.",
      price: getValue("PREDICTED PRICE") || "Analyzing scaling axis value metrics...",
      probability: getValue("PROBABILITY") || "Calculating variance tier...",
      levels: getValue("KEY LEVELS") || "Locating structural zones...",
      dynamics: getValue("MARKET DYNAMICS") || "Evaluating asset phase structural cycles...",
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
              <span className={`absolute h-3 w-3 rounded-full opacity-70 ${isNewsLoading || isAnalyzing || isChatThinking ? 'bg-amber-400 animate-ping' : 'bg-indigo-400 animate-pulse'}`}></span>
              <span className={`relative h-2 w-2 rounded-full ${isNewsLoading || isAnalyzing || isChatThinking ? 'bg-amber-500' : 'bg-indigo-500'}`}></span>
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
              onChange={(e) => setSelectedTimeframe(e.target.value)}
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
          Welcome to <strong className={isDarkMode ? "text-white" : "text-slate-900"}>FinSight AI</strong>. This workstation maps market signals. Use the <strong className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Chart Stream</strong> to track live assets.
          For image uploads, use the <strong className="text-cyan-500 font-bold">Vision Core</strong> layer, label your screenshot's exact asset and period context, and let the model analyze every individual candlestick structural formation across that specific timeline.
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
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider">{activeStockName}</h2>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md border border-indigo-500/20 font-bold font-mono">
                    {activeTimeframe} INTERVAL
                  </span>
                </div>
              </div>
              <div className={`w-full h-[380px] min-h-[380px] rounded-xl relative border flex flex-col overflow-hidden transition-colors duration-300 ${
                isDarkMode ? 'border-white/[0.08] bg-slate-950/80' : 'border-slate-200 bg-white shadow-inner'
              }`}>
                <PriceChart 
                  stockName={activeStockName} 
                  action={currentLabel} 
                  timeframe={activeTimeframe} 
                  isDarkMode={isDarkMode} 
                />
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
                  
                  {/* UTILITY CONTROL ENGINE HUB */}
                  <div className={`p-4 rounded-xl border flex flex-col space-y-3 transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-950/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">Target Screenshot Stock Name:</label>
                        <input
                          type="text"
                          value={visionStock}
                          onChange={(e) => setVisionStock(e.target.value.toUpperCase())}
                          placeholder="e.g., APPLE INC, NIFTY..."
                          className={`w-full px-3 py-1.5 text-xs rounded-lg font-bold font-mono border uppercase outline-none ${
                            isDarkMode ? 'bg-slate-950 border-white/[0.08] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">Target Screenshot Timeframe:</label>
                        <select
                          value={visionTimeframe}
                          onChange={(e) => setVisionTimeframe(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs rounded-lg font-bold font-mono border outline-none cursor-pointer ${
                            isDarkMode ? 'bg-slate-950 border-white/[0.08] text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600'
                          }`}
                        >
                          {timeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className={`flex flex-wrap gap-3 items-center justify-between pt-1.5 border-t ${
                      isDarkMode ? 'border-white/[0.04]' : 'border-slate-200'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUploadChange}
                        className={`text-xs font-mono file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:text-[10px] file:font-black file:uppercase transition-colors ${
                          isDarkMode 
                            ? 'text-slate-400 file:border-white/[0.08] file:bg-slate-800 file:text-slate-300' 
                            : 'text-slate-600 file:border-slate-300 file:bg-white file:text-slate-700'
                        }`}
                      />
                      <button
                        onClick={executeVisionAnalysis}
                        disabled={!uploadedImage || isAnalyzing || !visionStock.trim()}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:opacity-30 text-white font-mono font-bold text-[10px] uppercase px-4 py-2 rounded-lg transition-all"
                      >
                        {isAnalyzing ? "🔬 SCANNING CHANNELS..." : "⚡ RUN ANALYTICAL ENGINE"}
                      </button>
                    </div>
                  </div>

                  {/* VISUAL LAYOUT HUD GRAPHICS */}
                  <div className={`h-[360px] w-full rounded-xl relative overflow-hidden border flex items-center justify-center group shadow-2xl transition-colors duration-300 ${
                    isDarkMode ? 'bg-slate-950 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {uploadedImage ? (
                      <>
                        <img src={uploadedImage} alt="Ingested Segment Data" className="w-full h-full object-contain pointer-events-none opacity-60 transition-opacity" />

                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 600 360" preserveAspectRatio="none">
                          <defs>
                            <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="4" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          <path
                            d={
                              currentLabel === "BUY" ? "M 50 260 Q 200 320, 350 160 T 550 60" : 
                              currentLabel === "SELL" ? "M 50 80 Q 200 40, 350 220 T 550 300" : "M 50 180 Q 300 180, 550 180"
                            }
                            fill="none"
                            stroke={currentLabel === "BUY" ? "#10b981" : currentLabel === "SELL" ? "#ef4444" : currentLabel === "HOLD" ? "#3b82f6" : "#eab308"}
                            strokeWidth="3.5"
                            strokeDasharray="6 4"
                            style={{ filter: 'url(#hudGlow)' }}
                            className="transition-all duration-1000 ease-in-out"
                          />
                        </svg>

                        <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider z-30 border backdrop-blur-md flex items-center space-x-1.5 ${
                          currentLabel === "BUY" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          currentLabel === "SELL" ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          currentLabel === "HOLD" ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span>{visionStock} [{visionTimeframe}]</span>
                          <span>•</span>
                          <span>{parsedData.signalObj.emoji}</span>
                        </span>
                      </>
                    ) : (
                      <div className="text-center p-8 text-slate-500 font-mono text-[11px] uppercase tracking-widest max-w-sm leading-relaxed opacity-50">
                        📁 Enter target asset metrics and upload chart layout to trigger step-by-step candlestick frame matrix calculations.
                      </div>
                    )}
                  </div>
                </div>

                {/* 🎯 ADVANCED DESIGNED INSIGHTS PANEL */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">⚙️ FINSIGHT AI TECHNICAL RESULTS PANEL:</span>
     
                  {visionResponse.startsWith("Awaiting") || visionResponse.startsWith("🔄") ? (
                    <div className={`flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border font-mono text-center text-xs transition-colors duration-300 ${
                      isDarkMode ? 'bg-slate-950/40 border-white/[0.06] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <p className="tracking-widest uppercase font-bold animate-pulse">{visionResponse}</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col space-y-3 tab-animate">
                      
                      {/* TOP LEVEL ACTION HUD */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-xl ${
                        currentLabel === "BUY" ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 shadow-emerald-950/5' :
                        currentLabel === "SELL" ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 shadow-rose-950/5' :
                        currentLabel === "HOLD" ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 shadow-blue-950/5' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-600 shadow-amber-950/5'
                      }`}>
                        <div className="font-mono">
                          <span className="block text-[8px] uppercase tracking-widest opacity-60 font-bold">ALGORITHMIC ALPHA SIGNAL</span>
                          <span className="text-sm font-black uppercase tracking-wider">EXECUTION DECISION INDEX</span>
                        </div>
                        <div className="px-5 py-2 rounded-xl text-xs font-black font-mono tracking-widest border border-current shadow-md animate-pulse">
                          {parsedData.signalObj.emoji}
                        </div>
                      </div>

                      {/* STATS MATRIX QUAD GRID */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className={`p-3 rounded-xl border font-mono transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/50 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">⏱️ TIMEFRAME</span>
                          <span className="text-xs font-bold text-indigo-500 uppercase">{parsedData.timeframe}</span>
                        </div>
                        <div className={`p-3 rounded-xl border font-mono transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/50 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">🎯 TARGET PRICE</span>
                          <span className="text-xs font-bold text-cyan-600 uppercase">{parsedData.price}</span>
                        </div>
                        <div className={`p-3 rounded-xl border font-mono transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/50 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">🎲 PROBABILITY</span>
                          <span className="text-xs font-bold text-emerald-600 uppercase">{parsedData.probability}</span>
                        </div>
                        <div className={`p-3 rounded-xl border font-mono transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/50 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">🌀 MARKET PHASE</span>
                          <span className="text-xs font-bold text-purple-600 uppercase tracking-tight">{parsedData.dynamics}</span>
                        </div>
                      </div>

                      {/* MID LEVEL BOUNDARIES BLOCK */}
                      <div className={`p-3 rounded-xl border font-mono text-xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/40 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-1">🗺️ STRUCTURAL CEILINGS & FLOORS (KEY LEVELS)</span>
                        <span className={`text-xs font-semibold tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{parsedData.levels}</span>
                      </div>

                      {/* COMPREHENSIVE TEXT ANALYTICAL BLOCKS */}
                      <div className={`p-4 rounded-xl border font-mono flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[220px] custom-scroll transition-colors duration-300 ${
                        isDarkMode ? 'bg-slate-950/20 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">🕯️ FOCUS CANDLE FORMATION</span>
                          <p className={`text-xs font-bold leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{parsedData.candle}</p>
                        </div>
                        <div className={`pt-2.5 border-t ${isDarkMode ? 'border-white/[0.04]' : 'border-slate-200'}`}>
                          <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">🔍 TECHNICAL CONTEXT & RATIONALE</span>
                          <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{parsedData.reason}</p>
                        </div>
                      </div>

                      {/* SYSTEM ACCURACY DISCLAIMER FIELD */}
                      <div className="p-3 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border-amber-500/20 animate-pulse">
                        ⚠️ NOTE: THIS IS AN ALGORITHMIC PROBABILITY FIELD MATRIX, NOT A GUARANTEED ACCURATE FORECAST EFFECT.
                      </div>

                      {/* RAW LOG DRAWER FOR COMPLIANCE */}
                      <details className="opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
                        <summary className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">View Ingestion Engine String Dump</summary>
                        <pre className={`mt-2 p-3 rounded-lg text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-20 border transition-colors duration-300 ${
                          isDarkMode ? 'bg-slate-950 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>{visionResponse}</pre>
                      </details>

                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OPTION 3: MACRO FEED ENVIRONMENT */}
          {activeTab === 'NEWS_STREAM' && (
            <div className="flex-1 flex flex-col space-y-4 tab-animate">
              <div className={`pb-3 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400">ALGORITHMIC MACRO NEWS DATASET</h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scroll">
                {newsList.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                    <p className="text-xs font-mono uppercase tracking-widest">No active news feeds streamed into cluster index.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newsList.map((item, index) => (
                      <div key={index} className={`p-4 rounded-xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-950/40 border-white/[0.05]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className={`font-bold font-mono text-xs leading-snug transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.headline}</h4>
                          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase ${
                            item.sentiment === 'BUY' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 
                            item.sentiment === 'SELL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-slate-500/10 text-slate-500'
                          }`}>{item.sentiment}</span>
                        </div>
                        <p className={`text-[11px] font-mono mt-2.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OPTION 4: COPILOT AGENT */}
          {activeTab === 'COPILOT_CHAT' && (
            <div className="flex-1 flex flex-col h-[420px] tab-animate">
              <div className={`pb-3 mb-3 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                <h3 className="text-xs font-bold font-mono tracking-widest text-slate-400">QUANT COPILOT NLP LAYER ENVIRONMENT</h3>
              </div>
              <div className={`flex-1 overflow-y-auto p-4 rounded-xl border space-y-4 text-xs font-mono mb-4 custom-scroll shadow-inner transition-colors duration-300 ${
                isDarkMode ? 'bg-slate-950/50 border-white/[0.06]' : 'bg-slate-50 border-slate-200'
              }`}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 mt-12">
                    <p className="uppercase tracking-widest text-[9px] font-bold">Workstation Engine Node Awaiting Handshake Commands...</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[8px] opacity-30 uppercase tracking-widest text-slate-400 mb-1 px-1 font-bold">
                        {msg.role === 'user' ? '► Operator Query' : '◄ System Compute'}
                      </span>
                      <div className={`p-3 rounded-xl max-w-[80%] leading-relaxed transition-colors duration-300 ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600/90 text-white rounded-tr-none' 
                          : isDarkMode ? 'bg-slate-900 border border-white/[0.06] text-slate-300 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>{msg.text}</div>
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