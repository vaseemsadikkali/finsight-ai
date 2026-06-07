"use client";

import React, { useEffect, useState } from 'react';

interface PriceChartProps {
  stockName: string;
  action: string;
  timeframe: string;
  isDarkMode: boolean;
}

export default function PriceChart({ stockName, action, timeframe, isDarkMode }: PriceChartProps) {
  const [mounted, setMounted] = useState(false);
  const containerId = "tradingview_advanced_chart_pane";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const renderWidget = () => {
      const container = document.getElementById(containerId);
      if (!container || !(window as any).TradingView) return;

      // 1. ADVANCED TICKER SANITIZATION: Clean up descriptions into short trading tickers
      let rawAsset = stockName.toUpperCase().trim();
      
      // Filter out common descriptive corporate suffixes causing "symbol not found"
      rawAsset = rawAsset
        .replace(/\b(INDUSTRIES|LIMITED|LTD|CORP|CORPORATION|INC|CO|PLC|EQUITY)\b/g, "")
        .trim();

      // Fallback translations if user enters common descriptive indices/companies
      if (rawAsset === "RELIANCE") rawAsset = "RELIANCE";
      if (rawAsset === "NIFTY" || rawAsset === "NIFTY 50") rawAsset = "NIFTY1!";
      if (rawAsset === "BANKNIFTY" || rawAsset === "BANK NIFTY") rawAsset = "BANKNIFTY1!";

      // Properly append trading platform exchange context prefix
      const ticker = rawAsset.includes(":") ? rawAsset : `NSE:${rawAsset}`;

      // 2. DYNAMIC TIMEFRAME: Map UI labels to TradingView intervals
      const timeframeMap: Record<string, string> = {
        '1m': '1', '5m': '5', '15m': '15',
        '1H': '60', '4H': '240', '1D': 'D',
        '1W': 'W', '1M': 'M'
      };

      // Wipe out any prior broken iframes inside the layout container before creating a new one
      container.innerHTML = "";

      new (window as any).TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: timeframeMap[timeframe] || 'D',
        timezone: "Asia/Kolkata",
        theme: isDarkMode ? "dark" : "light",
        style: "1",
        locale: "en",
        container_id: containerId,
        hide_side_toolbar: false,
        allow_symbol_change: true,
      });
    };

    // Global script engine injector lifecycle guard
    const existingScript = document.getElementById("tradingview-widget-script");
    
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      // Script is already loaded globally, directly rebuild layout matrix frames
      renderWidget();
    }

  }, [mounted, stockName, timeframe, isDarkMode]);

  if (!mounted) {
    return (
      <div className="p-6 font-mono text-xs text-slate-500 min-h-[380px] flex items-center justify-center">
        LOADING TERMINAL ENGINES...
      </div>
    );
  }

  const isBuy = action?.toUpperCase().includes("BUY");
  const isSell = action?.toUpperCase().includes("SELL");

  // --- CONFIGURABLE COLOR MATRIX MAP ---
  const colors = {
    buy: isDarkMode ? "#06b6d4" : "#0891b2",       // Dark Cyan vs Deep Rich Cyan
    sell: isDarkMode ? "#f43f5e" : "#e11d48",      // Vibrant Rose vs Deep Crimson Rose
    neutral: isDarkMode ? "#475569" : "#94a3b8",   // Muted Steel vs Accessible Slate Gray
  };

  const currentStroke = isBuy ? colors.buy : isSell ? colors.sell : colors.neutral;

  return (
    <div className={`w-full h-full min-h-[380px] relative flex flex-col rounded-xl overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-white'
    }`}>
      <div id={containerId} className="w-full h-full flex-1" />
      
      {/* Absolute Dynamic Overlay Layer */}
      <div className="absolute top-12 left-16 w-[400px] h-[100px] pointer-events-none z-10 select-none hidden md:block">
        <svg className="w-full h-full" viewBox="0 0 400 140" preserveAspectRatio="none">
          <path
            d={isBuy ? "M 30 110 Q 150 130, 350 30" : isSell ? "M 30 30 Q 150 50, 350 110" : "M 30 70 L 350 70"}
            fill="none"
            stroke={currentStroke}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="transition-colors duration-300"
          />
          <text 
            x="40" 
            y={isBuy ? 40 : isSell ? 100 : 60} 
            fill={currentStroke} 
            className="text-[9px] font-mono font-black tracking-widest uppercase transition-colors duration-300"
          >
            {isBuy ? "↗ TARGET EXPANSION MATRIX" : isSell ? "↘ SYSTEM CORRECTION RUN" : "→ RANGE BOUND HORIZON"}
          </text>
        </svg>
      </div>
    </div>
  );
}