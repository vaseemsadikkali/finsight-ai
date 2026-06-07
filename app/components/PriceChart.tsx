"use client";

import React, { useEffect, useState, useRef } from 'react';

interface PriceChartProps {
  stockName: string;
  action: string;
  timeframe: string;
  isDarkMode: boolean;
}

export default function PriceChart({ stockName, action, timeframe, isDarkMode }: PriceChartProps) {
  const [mounted, setMounted] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const containerId = "tradingview_advanced_chart_pane";
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lifecycle 1: Safe Global Script Injection & Verification
  useEffect(() => {
    if (!mounted) return;

    const checkTradingViewGlobal = () => {
      if ((window as any).TradingView && (window as any).TradingView.widget) {
        setIsScriptReady(true);
      } else {
        // Poll briefly if script element exists but global objects are initializing
        initTimeoutRef.current = setTimeout(checkTradingViewGlobal, 100);
      }
    };

    const existingScript = document.getElementById("tradingview-widget-script");
    
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        checkTradingViewGlobal();
      };
      document.head.appendChild(script);
    } else {
      checkTradingViewGlobal();
    }

    return () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, [mounted]);

  // Lifecycle 2: Widget Rendering & Dom Matrix Synchronization
  useEffect(() => {
    if (!mounted || !isScriptReady) return;

    const renderWidget = () => {
      const container = document.getElementById(containerId);
      if (!container || !(window as any).TradingView?.widget) return;

      // 1. COMPREHENSIVE TICKER CLEANING
      let rawAsset = stockName.toUpperCase().trim();
      
      rawAsset = rawAsset
        .replace(/\b(INDUSTRIES|LIMITED|LTD|CORP|CORPORATION|INC|CO|PLC|EQUITY)\b/g, "")
        .trim();

      // Index and Symbol translations
      if (rawAsset === "RELIANCE") rawAsset = "RELIANCE";
      if (rawAsset === "NIFTY" || rawAsset === "NIFTY 50") rawAsset = "NIFTY1!";
      if (rawAsset === "BANKNIFTY" || rawAsset === "BANK NIFTY") rawAsset = "BANKNIFTY1!";
      
      // Dynamic cross-exchange pattern recognition rules
      let ticker = rawAsset.includes(":") ? rawAsset : `NSE:${rawAsset}`;
      
      // Auto-fallback fallback safety if clean text fails completely
      if (!rawAsset || rawAsset === "") {
        ticker = "NSE:RELIANCE";
      }

      // 2. TIMEFRAME INTERVAL DICTIONARY MAP
      const timeframeMap: Record<string, string> = {
        '1m': '1', '5m': '5', '15m': '15',
        '1H': '60', '4H': '240', '1D': 'D',
        '1W': 'W', '1M': 'M'
      };

      // Wipe structural DOM noise before fresh mount configurations
      container.innerHTML = "";

      new (window as any).TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: timeframeMap[timeframe] || 'D',
        timezone: "Asia/Kolkata",
        theme: isDarkMode ? "dark" : "light",
        style: "1", // Candlestick standard
        locale: "en",
        container_id: containerId,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        // Override inner properties to make chart clean for Vision Models
        studies_overrides: {},
        overrides: {
          "paneProperties.background": isDarkMode ? "#020617" : "#ffffff",
          "paneProperties.vertGridProperties.color": isDarkMode ? "rgba(71, 85, 105, 0.08)" : "rgba(203, 213, 225, 0.2)",
          "paneProperties.horzGridProperties.color": isDarkMode ? "rgba(71, 85, 105, 0.08)" : "rgba(203, 213, 225, 0.2)",
          "scalesProperties.textColor": isDarkMode ? "#94a3b8" : "#475569",
        }
      });
    };

    renderWidget();

  }, [mounted, isScriptReady, stockName, timeframe, isDarkMode]);

  if (!mounted || !isScriptReady) {
    return (
      <div className="p-6 font-mono text-xs text-slate-500 min-h-[380px] flex flex-col gap-2 items-center justify-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping mb-1"></span>
        <span className="tracking-widest">LOADING ADVANCED GRAPHIC ENGINE MATRIX...</span>
      </div>
    );
  }

  const isBuy = action?.toUpperCase().includes("BUY");
  const isSell = action?.toUpperCase().includes("SELL");

  const colors = {
    buy: isDarkMode ? "#06b6d4" : "#0891b2",
    sell: isDarkMode ? "#f43f5e" : "#e11d48",
    neutral: isDarkMode ? "#475569" : "#94a3b8",
  };

  const currentStroke = isBuy ? colors.buy : isSell ? colors.sell : colors.neutral;

  return (
    <div className={`w-full h-full min-h-[380px] relative flex flex-col rounded-xl overflow-hidden border border-slate-500/10 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-white'
    }`}>
      {/* Target Canvas Div */}
      <div id={containerId} className="w-full h-full flex-1 z-0" />
      
      {/* Absolute Dynamic Overlay Layer - Isolated pointer-events to prevent canvas blocking */}
      <div className="absolute top-12 left-16 w-[400px] h-[100px] pointer-events-none z-10 select-none hidden md:block opacity-60 hover:opacity-10 transition-opacity">
        <svg className="w-full h-full" viewBox="0 0 400 140" preserveAspectRatio="none">
          <path
            d={isBuy ? "M 30 110 Q 150 130, 350 30" : isSell ? "M 30 30 Q 150 50, 350 110" : "M 30 70 L 350 70"}
            fill="none"
            stroke={currentStroke}
            strokeWidth="2"
            strokeDasharray="5 5"
            className="transition-all duration-300 animate-[dash_20s_linear_infinite]"
          />
          <text 
            x="40" 
            y={isBuy ? 40 : isSell ? 100 : 60} 
            fill={currentStroke} 
            className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-80"
          >
            {isBuy ? "↗ TARGET EXPANSION MATRIX" : isSell ? "↘ SYSTEM CORRECTION RUN" : "→ RANGE BOUND HORIZON"}
          </text>
        </svg>
      </div>
    </div>
  );
}