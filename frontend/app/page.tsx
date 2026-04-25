"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, BellRing, Moon, Sun, Download, MapPin, ExternalLink, Newspaper, ShoppingCart, Calculator, Briefcase, Lock, LogOut, MessageCircle, X, Send, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const RupeeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="M6 13l8.5 8" />
    <path d="M6 13h3" />
    <path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);

const GoldLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center rounded-xl shadow-md bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 p-2 border border-yellow-200/50", className)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L5 7H19L22 17H2Z" fill="#FDE047" stroke="#854D0E" strokeWidth="1.5"/>
      <path d="M5 12L7 8H17L19 12" stroke="#854D0E" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M4 14H20" stroke="#854D0E" strokeWidth="1" strokeOpacity="0.3"/>
    </svg>
  </div>
);

const SilverLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center rounded-xl shadow-md bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 p-2 border border-gray-100/50", className)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L5 7H19L22 17H2Z" fill="#E5E7EB" stroke="#374151" strokeWidth="1.5"/>
      <path d="M5 12L7 8H17L19 12" stroke="#374151" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M4 14H20" stroke="#374151" strokeWidth="1" strokeOpacity="0.3"/>
    </svg>
  </div>
);

const BUY_LINKS = [
  { name: "Tanishq (Titan)", url: "https://www.tanishq.co.in/", desc: "Trusted jewelry & digital gold." },
  { name: "Kalyan Jewellers", url: "https://www.kalyanjewellers.net/", desc: "Physical stores & online delivery." },
  { name: "MMTC-PAMP", url: "https://mmtcpamp.com/", desc: "99.99+% pure gold and silver." },
  { name: "SafeGold", url: "https://www.safegold.com/", desc: "Buy digital gold starting at ₹10." },
  { name: "Malabar Gold", url: "https://www.malabargoldanddiamonds.com/", desc: "Extensive physical & online catalog." },
  { name: "Zerodha Coin", url: "https://coin.zerodha.com/", desc: "Invest in Sovereign Gold Bonds (SGBs) & Gold ETFs." }
];

export default function Dashboard() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  
  const [currentPrices, setCurrentPrices] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [cityPrices, setCityPrices] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [hiddenNews, setHiddenNews] = useState<Set<string>>(new Set());
  
  const [goldHistory, setGoldHistory] = useState<any[]>([]);
  const [silverHistory, setSilverHistory] = useState<any[]>([]);
  const [liveGoldData, setLiveGoldData] = useState<any[]>([]);
  const [liveSilverData, setLiveSilverData] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // New Advanced States
  const [marketMood, setMarketMood] = useState<any>(null);
  const [simulatorResults, setSimulatorResults] = useState<any>(null);
  const [crisisData, setCrisisData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [marketCountdown, setMarketCountdown] = useState<any[]>([]);
  const [actualVsPredict, setActualVsPredict] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<any[]>([]);
  const [shockAlert, setShockAlert] = useState<any>(null);

  // Simulator Inputs
  const [simInflation, setSimInflation] = useState(0);
  const [simUSD, setSimUSD] = useState(0);
  const [simDemand, setSimDemand] = useState(0);

  // Game/Quiz States
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameBalance, setGameBalance] = useState(1000000); // 10 Lakh virtual
  const [gamePosition, setGamePosition] = useState(0);
  
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [timeRange, setTimeRange] = useState("live");
  const [auditAsset, setAuditAsset] = useState("gold");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [levelAsset, setLevelAsset] = useState("gold");
  const [longTermAsset, setLongTermAsset] = useState("gold");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'bot', content: string}[]>([
    {role: 'bot', content: "Hello! I'm your BullionPulse assistant. How can I help you today?"}
  ]);

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    router.push('/login');
  };
  
  // Calculator States
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcPurity, setCalcPurity] = useState("22k");
  const [calcMakingCharge, setCalcMakingCharge] = useState(15);
  const [calcGST, setCalcGst] = useState(3);
  
  // SIP States
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(5);
  const [sipReturn, setSipReturn] = useState(12);
  
  // Portfolio States
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [portAsset, setPortAsset] = useState("gold_24k");
  const [portWeight, setPortWeight] = useState(10);
  const [portBuyPrice, setPortBuyPrice] = useState(0);

  // Alert States
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertAsset, setAlertAsset] = useState("gold_24k");
  const [alertCondition, setAlertCondition] = useState("below");
  const [alertPrice, setAlertPrice] = useState("");

  useEffect(() => {
    // Auth Check: If no user is logged in, send to login page
    const user = localStorage.getItem('current_user');
    if (!user) {
      router.push('/login');
      return;
    }

    setMounted(true);
    
    // Load persisted data
    const savedPortfolio = localStorage.getItem('gold_portfolio');
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
    
    const savedAlerts = localStorage.getItem('gold_alerts');
    if (savedAlerts) setAlerts(JSON.parse(savedAlerts));

    fetchDynamicData();
    fetchStaticData();
    fetchAdvancedData();
    
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    }, 1000);
    
    const dynamicInterval = setInterval(fetchDynamicData, 10 * 1000); // 10 seconds
    const staticInterval = setInterval(fetchStaticData, 60 * 1000); // 60 seconds
    const analyticsInterval = setInterval(async () => {
      try {
        const analyticsRes = await axios.get(`${API_BASE_URL}/market-analytics`);
        setAnalytics(analyticsRes.data);
      } catch (e) { console.error(e) }
    }, 120 * 1000); // 2 minutes for heavy analytics
    
    return () => { 
      clearInterval(clockInterval); 
      clearInterval(dynamicInterval); 
      clearInterval(staticInterval);
      clearInterval(analyticsInterval);
    };
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) localStorage.setItem('gold_portfolio', JSON.stringify(portfolio));
  }, [portfolio, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('gold_alerts', JSON.stringify(alerts));
  }, [alerts, mounted]);

  const fetchAdvancedData = async () => {
    try {
      const [mood, crisis, comp, events, count, avp] = await Promise.all([
        axios.get(`${API_BASE_URL}/market-mood`),
        axios.get(`${API_BASE_URL}/crisis-tracker`),
        axios.get(`${API_BASE_URL}/comparison-assets`),
        axios.get(`${API_BASE_URL}/historical-events`),
        axios.get(`${API_BASE_URL}/market-countdown`),
        axios.get(`${API_BASE_URL}/actual-vs-predict`)
      ]);
      setMarketMood(mood.data);
      setCrisisData(crisis.data);
      setComparisonData(comp.data);
      setHistoricalEvents(events.data);
      setMarketCountdown(count.data);
      setActualVsPredict(avp.data);
    } catch (e) { console.error(e); }
  };

  const fetchDynamicData = async () => {
    try {
      const [priceRes, cityRes, predRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/current-prices`),
        axios.get(`${API_BASE_URL}/city-prices`),
        axios.get(`${API_BASE_URL}/predict`)
      ]);
      
      const priceData = priceRes.data;
      setCurrentPrices(priceData);
      setShockAlert(priceData.shock_alert);
      setCityPrices(cityRes.data);
      setPredictions(predRes.data);
      
      // Update Live Graph Data
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLiveGoldData(prev => {
        const newData = [...prev, { Date: now, Price: priceData.gold.price_10g_24k }];
        return newData.slice(-50); // Keep last 50 ticks
      });
      setLiveSilverData(prev => {
        const newData = [...prev, { Date: now, Price: priceData.silver.price_1kg }];
        return newData.slice(-50);
      });
      
      setLoadingHistory(false);
    } catch (error) { console.error(error); }
  };

  const handleSimulate = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/simulator`, {
        params: { inflation: simInflation, usd_index: simUSD, demand_spike: simDemand }
      });
      setSimulatorResults(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchInitialData = async () => {
    try {
      const [histGold, histSilver, analyticsRes, predRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/historical-data/gold`, { params: { range: timeRange } }),
        axios.get(`${API_BASE_URL}/historical-data/silver`, { params: { range: timeRange } }),
        axios.get(`${API_BASE_URL}/market-analytics`),
        axios.get(`${API_BASE_URL}/predict`)
      ]);
      setGoldHistory(histGold.data);
      setSilverHistory(histSilver.data);
      setAnalytics(analyticsRes.data);
      setPredictions(predRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (mounted) {
      fetchInitialData();
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || timeRange === 'live') return;
    const fetchRangeData = async () => {
      setLoadingHistory(true);
      try {
        const [histGold, histSilver] = await Promise.all([
          axios.get(`${API_BASE_URL}/historical-data/gold`, { params: { range: timeRange } }),
          axios.get(`${API_BASE_URL}/historical-data/silver`, { params: { range: timeRange } })
        ]);
        setGoldHistory(histGold.data);
        setSilverHistory(histSilver.data);
      } catch (e) { console.error(e); }
      setLoadingHistory(false);
    };
    fetchRangeData();
  }, [timeRange, mounted]);

  const fetchStaticData = async () => {
    try {
      const newsRes = await axios.get(`${API_BASE_URL}/news`);
      
      setNews((prevNews) => {
        // Find which news items in the *new* fetch are actually brand new 
        // (meaning they didn't exist in our prevNews list)
        const prevIds = new Set(prevNews.map(n => n.id));
        const brandNewItems = newsRes.data.filter((n: any) => !prevIds.has(n.id));
        
        if (brandNewItems.length > 0) {
          // If there are brand new items, remove *only* those new items from the hidden set
          // so they appear at the top, but keep the previously cleared ones hidden.
          setHiddenNews(prevHidden => {
            const nextHidden = new Set(prevHidden);
            brandNewItems.forEach((item: any) => nextHidden.delete(item.id));
            return nextHidden;
          });
        }
        
        return newsRes.data;
      });
    } catch (error) { console.error(error); }
  };

  const getFilteredData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    let days = data.length;
    if (timeRange === "1m") days = 20;
    if (timeRange === "1y") days = 250;
    if (timeRange === "5y") days = 1250;
    return data.slice(-days).map(item => ({ ...item, Date: new Date(item.Date).toLocaleDateString() }));
  };

  if (!mounted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Initializing Secure Session...</p>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background text-foreground transition-colors duration-300 font-sans">
      {shockAlert?.detected && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-red-500 text-white p-2 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-ping" />
          Price Shock Detected! {shockAlert.severity} volatility in gold spot market. {shockAlert.score}σ deviation.
        </motion.div>
      )}

      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 via-yellow-600 to-gray-400 text-white rounded-xl shadow-inner">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <path d="M2 17L5 7H19L22 17H2Z" fill="#FDE047" stroke="#854D0E" strokeWidth="1.5"/>
              <path d="M5 12L7 8H17L19 12" stroke="#854D0E" strokeWidth="1" strokeOpacity="0.5"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-gray-500 uppercase">
                BullionPulse AI
              </h1>
              {marketMood && (
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", 
                  marketMood.score > 60 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                  marketMood.score < 40 ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20")}>
                  Mood: {marketMood.status} ({marketMood.score})
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{currentTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block mr-4">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs text-muted-foreground uppercase font-black tracking-tighter">Market Syncing</p>
            </div>
            <p className="text-sm font-semibold">{currentPrices?.timestamp || "Syncing..."}</p>
          </div>
          <Link href="/login" className="p-2 rounded-full hover:bg-secondary transition flex items-center justify-center text-muted-foreground hover:text-foreground">
            <Lock className="w-5 h-5" />
          </Link>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-secondary transition flex items-center justify-center text-red-500 hover:text-red-600" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full hover:bg-secondary transition">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.onstart = () => console.log('Voice activated');
                recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  setChatInput(transcript);
                  setIsChatOpen(true);
                };
                recognition.start();
              } else {
                alert("Voice recognition not supported in this browser.");
              }
            }}
            className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition group relative"
          >
            <Activity className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Voice Search</span>
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8 border-b pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
          { id: 'simulator', label: 'Price Simulator', icon: <Calculator className="w-4 h-4" /> },
          { id: 'comparison', label: 'Gold vs BTC vs Silver', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'insights', label: 'Market Insights', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'cities', label: 'City Prices', icon: <MapPin className="w-4 h-4" /> },
          { id: 'calculator', label: 'Jewellery Tools', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'portfolio', label: 'My Wealth', icon: <Briefcase className="w-4 h-4" /> },
          { id: 'etf', label: 'ETF Investing', icon: <TrendingUp className="w-4 h-4" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap", activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {analytics?.ai_summary && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">AI Market Brief (TL;DR)</h4>
                  <p className="text-sm font-medium leading-relaxed italic">"{analytics.ai_summary}"</p>
                </div>
              </div>
              <button 
                disabled={isGeneratingSummary}
                onClick={async () => {
                  setIsGeneratingSummary(true);
                  try {
                    const res = await axios.get(`${API_BASE_URL}/market-analytics`);
                    setAnalytics(res.data);
                  } catch (e) { console.error(e) }
                  setIsGeneratingSummary(false);
                }}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                {isGeneratingSummary ? "Generating..." : "Generate New"}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <PriceCard title="Gold 24K (per 10g)" price={currentPrices?.gold?.price_10g_24k} logo={<GoldLogo />} />
            <PriceCard title="Gold 22K (per 10g)" price={currentPrices?.gold?.price_10g_22k} logo={<GoldLogo className="opacity-80" />} />
            <PriceCard title="Silver (per 1kg)" price={currentPrices?.silver?.price_1kg} logo={<SilverLogo />} />
            <PriceCard title="Silver (per 10g)" price={currentPrices?.silver?.price_1kg ? currentPrices.silver.price_1kg / 100 : null} logo={<SilverLogo className="opacity-80" />} />
          </div>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Tomorrow's Bullion Outlook</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <PredictionCard title="Gold Forecast (24K per 10g)" data={predictions?.gold} isGold={true} currentPrice={currentPrices?.gold?.price_10g_24k} /> 
            <PredictionCard title="Silver Forecast (per 1kg)" data={predictions?.silver} isGold={false} currentPrice={currentPrices?.silver?.price_1kg} />
          </div>

          {/* Daily Pick Banner */}
          {(predictions?.gold || predictions?.silver) && (
            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-card border-2 border-primary/20 rounded-[3rem] p-10 mb-12 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:bg-primary/10 transition-all duration-1000"></div>
               
               <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12">
                  <div className="max-w-xl">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl shadow-primary/20">
                        <Lock size={12} fill="currentColor" /> Secure Daily Signal
                     </div>
                     <h3 className="text-4xl font-black mb-4 uppercase italic tracking-tighter leading-none">Investor Buy Guide</h3>
                     <p className="text-sm font-medium text-muted-foreground leading-relaxed opacity-80">
                        Strategic entry/exit points calculated every 3 hours. Buy at the <span className="text-foreground font-bold underline decoration-primary underline-offset-4">Fixed Entry</span> and secure profits at the <span className="text-foreground font-bold underline decoration-green-500 underline-offset-4">Target Price</span>.
                     </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
                     {/* Gold Signal Section */}
                     <div className="flex-1 bg-background/40 backdrop-blur-xl border border-primary/20 rounded-[2rem] p-6 relative group/gold hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary"><GoldLogo className="w-4 h-4" /></div>
                              <span className="text-xs font-black uppercase tracking-widest">Gold 24K</span>
                           </div>
                           <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", 
                              predictions.gold.recommendation.includes("BUY") ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                              {predictions.gold.recommendation}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Buy Price</p>
                              <p className="text-xl font-black tabular-nums">₹{predictions.gold.daily_buy_at.toLocaleString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-green-500 uppercase mb-1">Target</p>
                              <p className="text-xl font-black text-green-600 tabular-nums">₹{predictions.gold.daily_target.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                           <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                     </div>

                     {/* Silver Signal Section */}
                     <div className="flex-1 bg-background/40 backdrop-blur-xl border border-primary/10 rounded-[2rem] p-6 relative group/silver hover:border-primary/40 transition-all">
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                              <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-500"><SilverLogo className="w-4 h-4" /></div>
                              <span className="text-xs font-black uppercase tracking-widest">Silver 1KG</span>
                           </div>
                           <span className={cn("px-3 py-1 rounded-full text-[10px] font-black border", 
                              predictions.silver.recommendation.includes("BUY") ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                              {predictions.silver.recommendation}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Buy Price</p>
                              <p className="text-xl font-black tabular-nums">₹{predictions.silver.daily_buy_at.toLocaleString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-green-500 uppercase mb-1">Target</p>
                              <p className="text-xl font-black text-green-600 tabular-nums">₹{predictions.silver.daily_target.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                           <div className="h-full bg-zinc-400" style={{ width: '100%' }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          <div className="mb-12">
             <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b bg-secondary/30 flex justify-between items-center flex-wrap gap-4">
                   <h3 className="font-bold flex items-center gap-2 italic"><Activity className="w-4 h-4 text-primary" /> AI Accuracy Audit (30-Day History)</h3>
                   <div className="flex gap-2 items-center">
                     <div className="flex bg-background rounded-lg p-0.5 border">
                       <button onClick={() => setAuditAsset('gold')} className={cn("px-4 py-1.5 text-xs font-bold rounded shadow-sm", auditAsset === 'gold' ? "bg-primary text-white" : "text-muted-foreground")}>GOLD</button>
                       <button onClick={() => setAuditAsset('silver')} className={cn("px-4 py-1.5 text-xs font-bold rounded shadow-sm", auditAsset === 'silver' ? "bg-primary text-white" : "text-muted-foreground")}>SILVER</button>
                     </div>
                     <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-3 py-2 rounded-lg uppercase tracking-tighter">Verified Daily</span>
                   </div>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm">
                      <tr className="border-b text-[10px] font-black uppercase text-muted-foreground">
                        <th className="p-4">Date</th>
                        <th className="p-4">Actual Price</th>
                        <th className="p-4">AI Predicted</th>
                        <th className="p-4">Error Margin</th>
                        <th className="p-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actualVsPredict.map((row, i) => {
                        const actual = auditAsset === 'gold' ? row.actual_gold : row.actual_silver;
                        const predicted = auditAsset === 'gold' ? row.predicted_gold : row.predicted_silver;
                        const error = auditAsset === 'gold' ? row.error_gold : row.error_silver;
                        const accuracy = auditAsset === 'gold' ? row.accuracy_gold : row.accuracy_silver;
                        return (
                          <tr key={i} className="border-b last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="p-4 font-bold">{row.date}</td>
                            <td className="p-4 font-medium text-muted-foreground">₹{actual?.toLocaleString() || 0}</td>
                            <td className="p-4 font-black">₹{predicted?.toLocaleString() || 0}</td>
                            <td className={cn("p-4 font-bold", error < (auditAsset === 'gold' ? 300 : 800) ? "text-green-500" : "text-amber-500")}>±₹{error}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                 <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${accuracy}%` }}></div>
                                 </div>
                                 <span className="text-[10px] font-bold">{accuracy}%</span>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>

          <div className="mb-12">
             <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <Briefcase className="text-primary" /> Long-Term Wealth Projection
               </h3>
               <div className="flex bg-secondary rounded-lg p-0.5 border">
                  <button onClick={() => setLongTermAsset('gold')} className={cn("px-4 py-1.5 text-xs font-bold rounded shadow-sm", longTermAsset === 'gold' ? "bg-primary text-white" : "text-muted-foreground")}>GOLD</button>
                  <button onClick={() => setLongTermAsset('silver')} className={cn("px-4 py-1.5 text-xs font-bold rounded shadow-sm", longTermAsset === 'silver' ? "bg-primary text-white" : "text-muted-foreground")}>SILVER</button>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: "6-Month Outlook", data: longTermAsset === 'gold' ? predictions?.gold?.long_term?.gold_6m : predictions?.gold?.long_term?.silver_6m, roi: longTermAsset === 'gold' ? '5.5%' : '7.0%' },
                  { label: "1-Year Strategic Target", data: longTermAsset === 'gold' ? predictions?.gold?.long_term?.gold_1y : predictions?.gold?.long_term?.silver_1y, roi: longTermAsset === 'gold' ? '12.0%' : '15.0%' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-card to-secondary/20 border-2 border-primary/10 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                     <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                     <h4 className="text-sm font-black uppercase text-primary mb-6 tracking-widest">{item.label} ({longTermAsset === 'gold' ? '24K' : '1KG'})</h4>
                     
                     <div className="grid grid-cols-1 gap-6">
                        <div className="flex justify-between items-end border-b border-dashed pb-4">
                           <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Expected Target</p>
                              <p className="text-4xl font-black tracking-tighter text-foreground">₹{item.data?.target?.toLocaleString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-green-500 uppercase mb-1">Potential ROI</p>
                              <p className="text-xl font-bold text-green-600">+{item.roi}*</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-background/50 p-4 rounded-2xl border border-blue-500/20">
                              <p className="text-[10px] font-black text-blue-500 uppercase mb-1 flex items-center gap-1"><ShoppingCart size={10}/> Buy Below</p>
                              <p className="text-lg font-black text-blue-600">₹{item.data?.buy_below?.toLocaleString()}</p>
                           </div>
                           <div className="bg-background/50 p-4 rounded-2xl border border-red-500/20 text-right">
                              <p className="text-[10px] font-black text-red-500 uppercase mb-1 flex items-center justify-end gap-1"><TrendingUp size={10}/> Sell Above</p>
                              <p className="text-lg font-black text-red-600">₹{item.data?.sell_above?.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                     <p className="text-[9px] text-muted-foreground mt-6 font-medium leading-relaxed italic">
                        *ROI based on {longTermAsset === 'gold' ? '10-year' : 'industrial demand &'} historical CAGR. Not financial advice.
                     </p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold">{timeRange === 'live' ? "Live Market Tracking" : "Historical Retail Trends"}</h2>
            <div className="flex bg-secondary rounded-lg p-1">
              {["live", "1m", "1y", "5y", "30y"].map(range => (
                <button key={range} onClick={() => setTimeRange(range)} className={cn("px-4 py-1 text-sm rounded-md transition-all font-medium", timeRange === range ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>{range.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ChartCard 
                title={timeRange === 'live' ? "Gold Live Data (₹/10g)" : "Gold History (₹ per 10g 24K)"} 
                data={timeRange === 'live' ? liveGoldData : getFilteredData(goldHistory)} 
                loading={loadingHistory && timeRange !== 'live'} 
                color="#eab308" 
              />
            </div>
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold flex items-center gap-2 text-primary"><TrendingUp className="w-4 h-4" /> AI Key Levels</h3>
                <div className="flex bg-secondary rounded-lg p-0.5">
                  <button onClick={() => setLevelAsset('gold')} className={cn("px-2 py-1 text-[10px] font-bold rounded", levelAsset === 'gold' ? "bg-background shadow" : "text-muted-foreground")}>GOLD</button>
                  <button onClick={() => setLevelAsset('silver')} className={cn("px-2 py-1 text-[10px] font-bold rounded", levelAsset === 'silver' ? "bg-background shadow" : "text-muted-foreground")}>SILVER</button>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Resistance (Ceiling)</p>
                  <div className="text-2xl font-bold text-red-500">₹{(levelAsset === 'gold' ? analytics?.support_resistance?.resistance : analytics?.support_resistance?.silver_resistance)?.toLocaleString()}</div>
                  <div className="w-full bg-red-500/10 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-red-500 h-full w-[80%]"></div></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Pivot (Neutral)</p>
                  <div className="text-2xl font-bold">₹{(levelAsset === 'gold' ? analytics?.support_resistance?.pivot : analytics?.support_resistance?.silver_pivot)?.toLocaleString()}</div>
                  <div className="w-full bg-border h-1.5 rounded-full mt-2"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Support (Floor)</p>
                  <div className="text-2xl font-bold text-green-500">₹{(levelAsset === 'gold' ? analytics?.support_resistance?.support : analytics?.support_resistance?.silver_support)?.toLocaleString()}</div>
                  <div className="w-full bg-green-500/10 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-green-500 h-full w-[40%]"></div></div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-8 p-3 bg-secondary/30 rounded-lg italic">
                *Levels calculated using Fibonacci Pivot Point algorithms based on 30-day volatility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard 
              title={timeRange === 'live' ? "Silver Live Data (₹/1kg)" : "Silver History (₹ per 1kg)"} 
              data={timeRange === 'live' ? liveSilverData : getFilteredData(silverHistory)} 
              loading={loadingHistory && timeRange !== 'live'} 
              color="#9ca3af" 
            />
            <div className="bg-card border rounded-2xl p-6 shadow-sm h-full">
              <h3 className="font-semibold mb-6 flex justify-between items-center">
                <span>Seasonal Market Strength</span>
                <span className="text-xs font-normal text-muted-foreground">Historical 20yr Avg</span>
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {analytics?.seasonal_heatmap?.map((item: any) => (
                  <div key={item.month} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border border-white/5",
                        item.return > 3 ? "bg-green-600 text-white" :
                        item.return > 1.5 ? "bg-green-500/60 text-white" :
                        item.return > 0 ? "bg-green-500/20 text-green-600" :
                        "bg-red-500/20 text-red-600"
                      )}
                    >
                      {item.return > 0 ? '+' : ''}{item.return}%
                    </div>
                    <span className="text-[10px] mt-1 text-muted-foreground uppercase">{item.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs leading-relaxed font-medium">Historically, <strong className="text-primary">September and November</strong> are the strongest months for Gold in India due to festive demand.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'calculator' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calculator className="text-primary" /> Jewellery & Tax Calculator</h2>
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Weight (Grams)</label>
                      <input type="number" value={calcWeight} onChange={e => setCalcWeight(Number(e.target.value))} className="w-full p-3 rounded-xl border bg-background" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Gold Purity</label>
                      <select value={calcPurity} onChange={e => setCalcPurity(e.target.value)} className="w-full p-3 rounded-xl border bg-background">
                        <option value="24k">24K (99.9%)</option>
                        <option value="22k">22K (91.6%)</option>
                        <option value="18k">18K (75.0%)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Making Charges (%)</label>
                      <input type="number" value={calcMakingCharge} onChange={e => setCalcMakingCharge(Number(e.target.value))} className="w-full p-3 rounded-xl border bg-background" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">GST Rate (%)</label>
                      <input type="number" value={calcGST} onChange={e => setCalcGst(Number(e.target.value))} className="w-full p-3 rounded-xl border bg-background" />
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Base Gold Value:</span>
                      <span className="font-medium">
                        ₹{currentPrices?.gold ? (
                          (calcPurity === '24k' ? currentPrices.gold.price_1g_24k : 
                           calcPurity === '22k' ? currentPrices.gold.price_1g_22k : 
                           currentPrices.gold.price_1g_24k * 0.75) * calcWeight
                        ).toLocaleString(undefined, {maximumFractionDigits: 0}) : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-muted-foreground">
                      <span>Making Charges:</span>
                      <span>
                        + ₹{currentPrices?.gold ? (
                          ((calcPurity === '24k' ? currentPrices.gold.price_1g_24k : 
                           calcPurity === '22k' ? currentPrices.gold.price_1g_22k : 
                           currentPrices.gold.price_1g_24k * 0.75) * calcWeight) * (calcMakingCharge / 100)
                        ).toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2 text-muted-foreground">
                      <span>GST Amount ({calcGST}%):</span>
                      <span>
                        + ₹{currentPrices?.gold ? (
                          (((calcPurity === '24k' ? currentPrices.gold.price_1g_24k : 
                           calcPurity === '22k' ? currentPrices.gold.price_1g_22k : 
                           currentPrices.gold.price_1g_24k * 0.75) * calcWeight) * (1 + (calcMakingCharge / 100))) * (calcGST / 100)
                        ).toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border text-2xl font-black">
                      <span>Final Price:</span>
                      <span className="text-primary">
                        ₹{currentPrices?.gold ? (
                          (((calcPurity === '24k' ? currentPrices.gold.price_1g_24k : 
                           calcPurity === '22k' ? currentPrices.gold.price_1g_22k : 
                           currentPrices.gold.price_1g_24k * 0.75) * calcWeight) * (1 + (calcMakingCharge / 100))) * (1 + (calcGST / 100))
                        ).toLocaleString(undefined, {maximumFractionDigits: 0}) : 'Loading...'}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        const price = currentPrices?.gold ? (((calcPurity === '24k' ? currentPrices.gold.price_1g_24k : calcPurity === '22k' ? currentPrices.gold.price_1g_22k : currentPrices.gold.price_1g_24k * 0.75) * calcWeight) * (1 + (calcMakingCharge / 100))) : 0;
                        setPortfolio([...portfolio, { id: Date.now(), asset: `gold_${calcPurity}`, weight: calcWeight, buyPrice: price }]);
                        setActiveTab('portfolio');
                      }}
                      className="w-full mt-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
                      Save to My Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-primary" /> SIP Wealth Forecaster</h2>
              <FakeGoldTool />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><TrendingUp className="text-primary" /> Jewelry Fashion Trends (2026)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-[2.5rem] bg-secondary/50 overflow-hidden relative border border-border/50 group-hover:border-primary/50 transition-all shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-white text-xs font-bold uppercase mb-1">Antique Gold</p>
                    <h4 className="text-white font-black text-lg">Royal Temple Choker</h4>
                  </div>
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 italic text-2xl font-black select-none">
                    TREND {i}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'portfolio' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Briefcase className="text-primary" /> My Investment Portfolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="md:col-span-1 bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 border-b pb-2">Add Asset</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Asset Type</label>
                    <select value={portAsset} onChange={e => setPortAsset(e.target.value)} className="w-full p-2 rounded-lg border bg-background text-sm">
                      <option value="gold_24k">Gold (24K)</option>
                      <option value="silver">Silver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Weight (Grams)</label>
                    <input type="number" value={portWeight} onChange={e => setPortWeight(Number(e.target.value))} className="w-full p-2 rounded-lg border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Purchase Price (Total ₹)</label>
                    <input type="number" value={portBuyPrice} onChange={e => setPortBuyPrice(Number(e.target.value))} className="w-full p-2 rounded-lg border bg-background text-sm" />
                  </div>
                  <button 
                    onClick={() => {
                      setPortfolio([...portfolio, { id: Date.now(), asset: portAsset, weight: portWeight, buyPrice: portBuyPrice }]);
                      setPortWeight(10);
                      setPortBuyPrice(0);
                    }}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
                    Add to Portfolio
                  </button>
                </div>
             </div>
             
             <div className="md:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b bg-secondary/50 font-semibold">Current Holdings</div>
                {portfolio.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">No assets added yet. Add your holdings to track profit/loss.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b text-xs text-muted-foreground uppercase bg-background">
                        <tr><th className="p-3">Asset</th><th className="p-3">Weight</th><th className="p-3">Invested</th><th className="p-3">Current Value</th><th className="p-3">P/L</th><th className="p-3">Action</th></tr>
                      </thead>
                      <tbody>
                        {portfolio.map(item => {
                          const currentVal = item.asset === 'gold_24k' 
                            ? (currentPrices?.gold?.price_1g_24k || 0) * item.weight
                            : (currentPrices?.silver?.price_1kg ? (currentPrices.silver.price_1kg / 1000) * item.weight : 0);
                          const pl = currentVal - item.buyPrice;
                          const plPercent = item.buyPrice > 0 ? (pl / item.buyPrice) * 100 : 0;
                          
                          return (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/20">
                              <td className="p-3 font-medium capitalize flex items-center gap-2">
                                {item.asset.includes('gold') ? <GoldLogo className="w-6 h-6 p-1 scale-75" /> : <SilverLogo className="w-6 h-6 p-1 scale-75" />}
                                {item.asset.replace('_', ' ')}
                              </td>
                              <td className="p-3">{item.weight}g</td>
                              <td className="p-3">₹{item.buyPrice.toLocaleString()}</td>
                              <td className="p-3 font-semibold">₹{currentVal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                              <td className={cn("p-3 font-bold", pl >= 0 ? "text-green-500" : "text-red-500")}>
                                {pl >= 0 ? '+' : ''}₹{pl.toLocaleString(undefined, {maximumFractionDigits: 0})} ({plPercent.toFixed(2)}%)
                              </td>
                              <td className="p-3">
                                <button onClick={() => setPortfolio(portfolio.filter(p => p.id !== item.id))} className="text-xs text-red-500 hover:text-red-600 bg-red-500/10 px-2 py-1 rounded">Delete</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'simulator' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calculator className="text-primary" /> Gold Price AI Simulator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">Simulation Parameters</h3>
              <div className="space-y-8">
                <div>
                  <label className="flex justify-between text-xs font-bold uppercase mb-4">
                    <span>US Inflation Rate</span>
                    <span className="text-primary">{simInflation}%</span>
                  </label>
                  <input type="range" min="-5" max="15" step="0.1" value={simInflation} onChange={e => setSimInflation(Number(e.target.value))} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold uppercase mb-4">
                    <span>USD Index (DXY) Change</span>
                    <span className="text-primary">{simUSD}%</span>
                  </label>
                  <input type="range" min="-10" max="10" step="0.1" value={simUSD} onChange={e => setSimUSD(Number(e.target.value))} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-bold uppercase mb-4">
                    <span>Global Demand Spike</span>
                    <span className="text-primary">{simDemand}%</span>
                  </label>
                  <input type="range" min="0" max="20" step="0.5" value={simDemand} onChange={e => setSimDemand(Number(e.target.value))} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <button onClick={handleSimulate} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg">Run AI Simulation</button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl flex-1 flex flex-col justify-center text-center">
                <p className="text-xs font-bold uppercase opacity-70 mb-2">Simulated Price (10g 24K)</p>
                <div className="text-5xl font-black mb-4">
                  ₹{simulatorResults ? simulatorResults.simulated_price.toLocaleString() : (currentPrices?.gold?.price_10g_24k || 0).toLocaleString()}
                </div>
                <div className={cn("inline-flex items-center gap-1 self-center px-4 py-1 rounded-full text-sm font-bold bg-white/20 backdrop-blur-md", 
                  (simulatorResults?.change_pct || 0) >= 0 ? "text-green-300" : "text-red-300")}>
                  {simulatorResults?.change_pct >= 0 ? '+' : ''}{simulatorResults?.change_pct || 0}% Change
                </div>
              </div>
              <div className="bg-card border rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Scenario Impact Analysis</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Inflation Hedge Effect</span>
                    <span className="font-bold text-green-500">+ ₹{Math.round(simInflation * 1.2 * (currentPrices?.gold?.price_10g_24k || 0) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">USD Inverse Correlation</span>
                    <span className="font-bold text-red-500">- ₹{Math.round(simUSD * 0.8 * (currentPrices?.gold?.price_10g_24k || 0) / 100).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'comparison' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2 uppercase">Asset Showdown</h2>
              <p className="text-sm text-muted-foreground font-medium">Comparison of normalized performance over 30 days (Base 100)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> <span className="text-[10px] font-bold uppercase">Gold</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> <span className="text-[10px] font-bold uppercase">Bitcoin</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400"></div> <span className="text-[10px] font-bold uppercase">Silver</span></div>
            </div>
          </div>

          <div className="bg-card border rounded-[2.5rem] p-8 shadow-sm h-[500px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData?.dates?.map((date: string, i: number) => ({
                Date: date,
                Gold: comparisonData.gold[i],
                Silver: comparisonData.silver[i],
                Bitcoin: comparisonData.bitcoin[i]
              }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                <XAxis dataKey="Date" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="Gold" stroke="#eab308" strokeWidth={3} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="Bitcoin" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="Silver" stroke="#9ca3af" strokeWidth={3} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Volatility Index</p>
                <h4 className="text-xl font-black">Low (Gold)</h4>
              </div>
              <div className="w-12 h-1.5 bg-green-500 rounded-full"></div>
            </div>
            <div className="bg-card border rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Growth Leader</p>
                <h4 className="text-xl font-black">Bitcoin (+12%)</h4>
              </div>
              <TrendingUp className="text-blue-500" />
            </div>
            <div className="bg-card border rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Inflation Hedge</p>
                <h4 className="text-xl font-black">Superior (Gold)</h4>
              </div>
              <Lock className="text-yellow-500" />
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'insights' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Newspaper className="text-primary" /> Global Crisis Tracker</h2>
              <div className="space-y-4">
                {crisisData.map((item) => (
                  <div key={item.id} className="bg-card border rounded-2xl p-5 hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg group-hover:text-primary transition">{item.event}</h4>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", 
                        item.risk_level === 'High' ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                        {item.risk_level} Risk
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Historical Impact: <strong className="text-foreground">{item.impact}</strong></span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-8">Upcoming Market Events</h2>
              <div className="bg-secondary/30 rounded-3xl p-6">
                {marketCountdown.map((event, i) => (
                  <div key={i} className="flex justify-between items-center mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0 border-border/50">
                    <div>
                      <h4 className="font-bold">{event.event}</h4>
                      <p className="text-xs text-muted-foreground">Impact: <span className="text-primary font-bold">{event.impact}</span></p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black">{event.days}d {event.hours}h</div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-8">Bullion History Timeline</h2>
              <div className="relative pl-8 border-l-2 border-primary/20 space-y-12">
                {historicalEvents.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                    <span className="text-xs font-black text-primary uppercase tracking-tighter">{item.year}</span>
                    <h4 className="font-bold text-lg mb-2">{item.event}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'etf' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Direct Bullion Investing</h2>
              <p className="text-sm text-muted-foreground font-medium">Liquid Gold & Silver ETFs via major Indian exchanges.</p>
            </div>
            <div className="flex bg-secondary/50 p-1 rounded-xl border">
               <button className="px-6 py-2 bg-background rounded-lg text-xs font-bold shadow-sm">NSE/BSE</button>
               <button className="px-6 py-2 text-xs font-bold text-muted-foreground">DIGITAL GOLD</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Nippon India Gold BEES", symbol: "GOLDBEES", expense: "0.82%", provider: "Nippon Life", link: "https://mf.nipponindiaim.com/FundsAndPerformance/Pages/NipponIndia-ETF-Gold-BeES.aspx" },
              { name: "ICICI Prudential Gold ETF", symbol: "IPRU_GOLD", expense: "0.50%", provider: "ICICI Pru", link: "https://www.icicipruamc.com/mutual-fund/exchange-traded-funds/icici-prudential-gold-etf" },
              { name: "HDFC Gold ETF", symbol: "HDFC_GOLD", expense: "0.59%", provider: "HDFC AMC", link: "https://www.hdfcfund.com/product-solutions/overview/hdfc-gold-exchange-traded-fund/regular" },
              { name: "ICICI Silver ETF", symbol: "SILVER_ETF", expense: "0.60%", provider: "ICICI Pru", link: "https://www.icicipruamc.com/mutual-fund/exchange-traded-funds/icici-prudential-silver-etf" },
              { name: "Nippon Silver BEES", symbol: "SILVERBEES", expense: "0.75%", provider: "Nippon Life", link: "https://mf.nipponindiaim.com/FundsAndPerformance/Pages/NipponIndia-Silver-ETF.aspx" },
              { name: "SBI Gold ETF", symbol: "SBI_GOLD", expense: "0.64%", provider: "SBI MF", link: "https://www.sbimf.com/mutual-fund/exchange-traded-funds/sbi-gold-etf" }
            ].map((etf, i) => (
              <div key={i} className="bg-card border rounded-3xl p-6 hover:border-primary transition-all group shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {etf.name.includes('Silver') ? <SilverLogo className="w-6 h-6" /> : <GoldLogo className="w-6 h-6" />}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">Exchange Symbol</span>
                    <span className="font-black text-lg tracking-tighter">{etf.symbol}</span>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{etf.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Managed by {etf.provider}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-dashed">
                   <div>
                     <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Expense Ratio</span>
                     <span className="font-bold text-sm">{etf.expense}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Liquidity</span>
                     <span className="font-bold text-sm text-green-500">High</span>
                   </div>
                </div>

                <div className="flex gap-2 mt-auto">
                   <a href={etf.link} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-secondary hover:bg-primary hover:text-white rounded-xl text-center text-xs font-black uppercase transition-all">Official AMC Buy</a>
                   <button 
                    onClick={() => {
                      const assetType = etf.name.includes('Silver') ? 'silver' : 'gold_24k';
                      const currentPrice = assetType === 'gold_24k' ? (currentPrices?.gold?.price_1g_24k || 6000) : (currentPrices?.silver?.price_1kg / 1000 || 75);
                      setPortfolio([...portfolio, { id: Date.now(), asset: assetType, weight: 1, buyPrice: currentPrice }]);
                      setActiveTab('portfolio');
                    }}
                    className="p-3 bg-primary/5 hover:bg-primary/20 rounded-xl transition-colors" title="Save to Portfolio">
                     <Briefcase className="w-4 h-4 text-primary" />
                   </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter border-t pt-8">Digital Gold Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "SafeGold", desc: "24K 99.99% Pure Gold", pros: "Can convert to physical coins. Minimum ₹10.", link: "https://www.safegold.com/" },
              { name: "MMTC-PAMP", desc: "India's only LBMA accredited refinery", pros: "Highest purity guarantee. Swiss standards.", link: "https://mmtcpamp.com/digital-gold" },
              { name: "Augmont", desc: "Gold for All", pros: "Backed by physical gold. Delivered to door.", link: "https://www.augmont.com/" },
              { name: "Zerodha / Groww", desc: "Buy directly from broker", pros: "Integrated into your main investing app.", link: "https://zerodha.com/" }
            ].map((dg, i) => (
               <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                 <div>
                    <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{dg.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{dg.desc}</p>
                    <span className="text-[10px] font-black uppercase bg-secondary px-2 py-1 rounded">{dg.pros}</span>
                 </div>
                 <a href={dg.link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 ml-4">
                    <TrendingUp className="w-5 h-5" />
                 </a>
               </div>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8">
             <div className="flex-1">
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Why invest in ETFs?</h3>
                <ul className="space-y-4">
                  {[
                    "Zero making charges compared to physical jewelry.",
                    "No storage or theft risks (held in your Demat account).",
                    "Extremely high liquidity - sell and get cash in T+2 days.",
                    "Buy even small amounts (as low as 1 unit / approx 1 gram)."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium">
                       <div className="bg-primary text-white p-1 rounded-full mt-0.5"><Activity size={10} /></div>
                       {text}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="w-full md:w-64 bg-white dark:bg-zinc-900 rounded-3xl p-6 border shadow-2xl rotate-3 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                   <TrendingUp size={32} />
                </div>
                <h4 className="font-black text-xl mb-2">Taxes in India</h4>
                <p className="text-xs text-muted-foreground font-medium mb-4 leading-relaxed">Gold/Silver ETFs are now taxed at your income tax slab rate (Short Term Capital Gains) as per recent budget rules.</p>
                <div className="text-[10px] font-bold uppercase py-1 px-3 bg-secondary rounded-full">Finance Act 2024</div>
             </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'alerts' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BellRing className="text-primary" /> Smart Price Alerts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="md:col-span-1 bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 border-b pb-2">Create Alert</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Asset</label>
                    <select value={alertAsset} onChange={e => setAlertAsset(e.target.value)} className="w-full p-2 rounded-lg border bg-background text-sm">
                      <option value="gold_24k">Gold (24K per 10g)</option>
                      <option value="silver">Silver (per 1kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Condition</label>
                    <select value={alertCondition} onChange={e => setAlertCondition(e.target.value)} className="w-full p-2 rounded-lg border bg-background text-sm">
                      <option value="above">Goes Above</option>
                      <option value="below">Drops Below</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Target Price (₹)</label>
                    <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} placeholder="e.g. 70000" className="w-full p-2 rounded-lg border bg-background text-sm" />
                  </div>
                  <button 
                    onClick={() => {
                      if (!alertPrice) return;
                      setAlerts([...alerts, { id: Date.now(), asset: alertAsset, condition: alertCondition, price: Number(alertPrice), active: true }]);
                      setAlertPrice("");
                    }}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
                    Set Alert
                  </button>
                </div>
             </div>
             
             <div className="md:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b bg-secondary/50 font-semibold">Active Alerts</div>
                {alerts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">No alerts set. Get notified when targets are hit!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b text-xs text-muted-foreground uppercase bg-background">
                        <tr><th className="p-3">Asset</th><th className="p-3">Condition</th><th className="p-3">Target Price</th><th className="p-3">Status</th></tr>
                      </thead>
                      <tbody>
                        {alerts.map(item => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-secondary/20">
                              <td className="p-3 font-medium capitalize flex items-center gap-2">
                                {item.asset.includes('gold') ? <GoldLogo className="w-6 h-6 p-1 scale-75" /> : <SilverLogo className="w-6 h-6 p-1 scale-75" />}
                                {item.asset.replace('_', ' ')}
                              </td>
                              <td className="p-3 capitalize">{item.condition}</td>
                              <td className="p-3 font-semibold">₹{item.price.toLocaleString()}</td>
                              <td className="p-3"><span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold">ACTIVE</span></td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'cities' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><MapPin className="text-primary" /> Today's Rates Across India</h2>
          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-secondary/50 border-b">
                <tr><th className="p-4 font-semibold">City</th><th className="p-4 font-semibold text-yellow-600">Gold (24K) per 10g</th><th className="p-4 font-semibold text-yellow-500">Gold (22K) per 10g</th><th className="p-4 font-semibold text-gray-400">Silver per 1kg</th></tr>
              </thead>
              <tbody>
                {cityPrices.map((city, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-secondary/20 transition">
                    <td className="p-4 font-medium">{city.city}</td><td className="p-4">₹{city.gold_10g_24k.toLocaleString()}</td><td className="p-4">₹{city.gold_10g_22k.toLocaleString()}</td><td className="p-4">₹{city.silver_1kg.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'buy' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingCart className="text-primary" /> Where to Buy Verified Gold</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUY_LINKS.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold group-hover:text-primary transition">{link.name}</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{link.desc}</p>
                  </div>
                  <div className="mt-6 text-sm font-medium text-primary">Visit Website &rarr;</div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'news' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Newspaper className="text-primary" /> Latest Market Updates</h2>
            <button onClick={() => setHiddenNews(new Set([...Array.from(hiddenNews), ...news.map(n => n.id)]))} className="text-xs px-3 py-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition">Clear All</button>
          </div>
          <div className="grid gap-4">
            {news.filter(n => !hiddenNews.has(n.id)).map((item, idx) => (
              <div key={idx} className="bg-card border border-border/50 rounded-xl p-5 hover:bg-secondary/30 transition flex justify-between items-center gap-4 group">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition">{item.title}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">{item.publisher} • {item.providerPublishTime}</p>
                    {item.sentiment && (
                      <span className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border",
                        item.sentiment === 'positive' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                        item.sentiment === 'negative' ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                        "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      )}>
                        {item.sentiment}
                      </span>
                    )}
                  </div>
                </a>
                <button onClick={(e) => { e.preventDefault(); setHiddenNews(new Set([...hiddenNews, item.id])); }} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition rounded-md">✕</button>
              </div>
            ))}
            {news.filter(n => !hiddenNews.has(n.id)).length === 0 && <div className="text-center p-12 text-muted-foreground bg-card border rounded-2xl">You're all caught up! Checking for new updates...</div>}
          </div>
        </motion.div>
      )}

      {/* Floating Chatbot */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card border shadow-2xl rounded-3xl w-80 sm:w-96 mb-4 overflow-hidden flex flex-col max-h-[500px]"
            >
              <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold">BullionPulse AI Assistant</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setChatMessages([{role: 'bot', content: "Chat cleared. How can I help you now?"}])}
                    className="text-[10px] uppercase font-bold bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
                  >
                    Clear
                  </button>
                  <button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5 opacity-70 hover:opacity-100" /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10 min-h-[300px]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed", msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  const userMsg = chatInput;
                  setChatInput("");
                  setChatMessages(prev => [...prev, {role: 'user', content: userMsg}]);
                  
                  try {
                    const res = await axios.get(`${API_BASE_URL}/chat`, { params: { query: userMsg } });
                    setChatMessages(prev => [...prev, {role: 'bot', content: res.data.response}]);
                  } catch (err) {
                    setChatMessages(prev => [...prev, {role: 'bot', content: "I'm sorry, I'm having trouble thinking right now. Please try again!"}]);
                  }
                }}
                className="p-4 border-t bg-card flex gap-2"
              >
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-secondary/50 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition shadow-md shadow-primary/20">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95", isChatOpen ? "bg-card border text-primary rotate-90" : "bg-primary text-primary-foreground")}
        >
          {isChatOpen ? <X /> : <MessageCircle />}
        </button>
      </div>
    </div>
  );
}

const PriceCard = ({ title, price, logo }: any) => (
  <motion.div 
    key={price} // Trigger animation on price change
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
  >
    <div className="absolute top-2 right-2 flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Live</span>
    </div>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      {logo}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black tabular-nums">{price ? `₹${price.toLocaleString()}` : '---'}</span>
    </div>
    <p className="text-[8px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Updated just now</p>
  </motion.div>
);

const PredictionCard = ({ title, data, isGold, currentPrice }: any) => {
  if (!data) return <div className="bg-card border rounded-2xl p-6 h-32 flex items-center justify-center"><LoadingSpinner /></div>;
  const isUp = data.trend === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const liveForecast = data.live_forecast;
  const dailyBuyAt = data.daily_buy_at;
  const dailyTarget = data.daily_target;

  const confidence = data.confidence || 85;
  const recColor = data.recommendation?.includes("BUY") ? "text-green-500 bg-green-500/10 border-green-500/20" 
                 : data.recommendation?.includes("SELL") ? "text-red-500 bg-red-500/10 border-red-500/20"
                 : "text-blue-500 bg-blue-500/10 border-blue-500/20";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm overflow-hidden relative group hover:border-primary/40 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
        {isGold ? <GoldLogo /> : <SilverLogo />}
      </div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
         <div className="flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</h3>
            {isGold && (
               <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(234,179,8,1)]"></div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Gold Secure Daily Signal</span>
               </div>
            )}
         </div>
         {data.recommendation && (
            <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border shadow-sm", recColor)}>
               {data.recommendation}
            </span>
         )}
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
         <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Target Forecast</p>
            <p className="text-4xl font-black tracking-tighter">₹{dailyTarget?.toLocaleString()}</p>
         </div>
         <div className="text-right">
            <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black mb-1", isUp ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
               <Icon className="w-3 h-3" />{data.percent_change}%
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Expected Trend</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10 pt-4 border-t border-dashed">
         <div>
            <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Buy Entry</p>
            <p className="text-lg font-black text-blue-500">₹{dailyBuyAt?.toLocaleString()}</p>
         </div>
         <div className="text-right">
            <p className="text-[9px] font-black uppercase text-primary mb-1 flex items-center justify-end gap-1">
               <span className="h-1 w-1 rounded-full bg-primary"></span> Live AI Tick
            </p>
            <p className="text-lg font-black opacity-80 tabular-nums">₹{liveForecast?.toLocaleString()}</p>
         </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 relative z-10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black uppercase text-muted-foreground">Model Confidence</span>
          <span className="text-[10px] font-black text-primary">{confidence}% Verified</span>
        </div>
        <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            className="bg-primary h-full"
          />
        </div>
      </div>
    </motion.div>
  );
};
const FakeGoldTool = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Visual Inspection", desc: "Look for hallmarks like 916 (22K) or 999 (24K). Fake items often miss these or have 'GP' (Gold Plated)." },
    { title: "Magnet Test", desc: "Gold is NOT magnetic. If your jewellery sticks to a strong magnet, it's definitely fake or heavily alloyed." },
    { title: "Density Test (Archimedes)", desc: "Weigh your item in air, then in water. Gold 24K density is 19.3g/ml. Ratio = Weight / (Weight - Submerged Weight)." },
    { title: "Nitric Acid Test", desc: "Professional test: A drop of nitric acid will turn fake gold green. Real gold stays unchanged." }
  ];

  return (
    <div className="bg-card border rounded-3xl p-6 shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-600"><Lock className="w-5 h-5" /> Fake Gold Detection Tool</h3>
      <div className="bg-secondary/30 rounded-2xl p-6 mb-6">
        <div className="text-xs font-bold text-primary uppercase mb-1">Step {step + 1} of 4</div>
        <h4 className="font-bold text-lg mb-2">{steps[step].title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{steps[step].desc}</p>
      </div>
      <div className="flex gap-2">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 py-3 border rounded-xl font-bold text-sm">Previous</button>}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm">Next Step</button>
        ) : (
          <button onClick={() => setStep(0)} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-sm">Finish & Verify</button>
        )}
      </div>
    </div>
  );
};

const ChartCard = ({ title, data, loading, color }: any) => (
  <div className="bg-card border rounded-2xl p-6 shadow-sm overflow-hidden h-full flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-semibold">{title}</h3>
    </div>
    {loading ? <LoadingSpinner /> : (
      <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis dataKey="Date" minTickGap={30} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
            <Line type="monotone" dataKey="Price" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
