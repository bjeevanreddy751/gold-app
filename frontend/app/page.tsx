"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity, BellRing, Moon, Sun, Download, MapPin, ExternalLink, Newspaper, ShoppingCart } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-950">
      <circle cx="12" cy="12" r="8" fill="#FDE047" stroke="none" />
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8" />
      <path d="M8.5 10.5a3.5 3.5 0 0 1 7 0" />
      <path d="M8.5 13.5a3.5 3.5 0 0 0 7 0" />
    </svg>
  </div>
);

const SilverLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center rounded-xl shadow-md bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 p-2 border border-gray-100/50", className)}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#E5E7EB" stroke="none" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
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
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [timeRange, setTimeRange] = useState("1y");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setMounted(true);
    fetchData();
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    }, 1000);
    const dataInterval = setInterval(fetchData, 10 * 1000);
    return () => { clearInterval(clockInterval); clearInterval(dataInterval); };
  }, []);

  const fetchData = async () => {
    try {
      const [priceRes, predRes, cityRes, newsRes, histGold, histSilver] = await Promise.all([
        axios.get(`${API_BASE_URL}/current-prices`),
        axios.get(`${API_BASE_URL}/predict`),
        axios.get(`${API_BASE_URL}/city-prices`),
        axios.get(`${API_BASE_URL}/news`),
        axios.get(`${API_BASE_URL}/historical-data/gold`),
        axios.get(`${API_BASE_URL}/historical-data/silver`)
      ]);
      setCurrentPrices(priceRes.data);
      setPredictions(predRes.data);
      setCityPrices(cityRes.data);
      setNews(newsRes.data);
      setGoldHistory(histGold.data);
      setSilverHistory(histSilver.data);
      setLoadingHistory(false);
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background text-foreground transition-colors duration-300 font-sans">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 via-yellow-600 to-gray-400 text-white rounded-xl shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-gray-500 uppercase">
                BullionPulse AI
              </h1>
              <div className="flex gap-1.5 items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-sm border border-yellow-200/50" />
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-sm border border-gray-100/50" />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{currentTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-muted-foreground">Market Updated</p>
            <p className="text-sm font-semibold">{currentPrices?.timestamp || "Syncing..."}</p>
          </div>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full hover:bg-secondary transition">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex gap-4 mb-8 border-b pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
          { id: 'cities', label: 'City Prices', icon: <MapPin className="w-4 h-4" /> },
          { id: 'buy', label: 'Where to Buy', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'news', label: 'Market News', icon: <Newspaper className="w-4 h-4" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap", activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <PriceCard title="Gold 24K (per 10g)" price={currentPrices?.gold?.price_10g_24k} logo={<GoldLogo />} />
            <PriceCard title="Gold 22K (per 10g)" price={currentPrices?.gold?.price_10g_22k} logo={<GoldLogo className="opacity-80" />} />
            <PriceCard title="Silver (per 1kg)" price={currentPrices?.silver?.price_1kg} logo={<SilverLogo />} />
            <PriceCard title="Silver (per 10g)" price={currentPrices?.silver?.price_1kg ? currentPrices.silver.price_1kg / 100 : null} logo={<SilverLogo className="opacity-80" />} />
          </div>

          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> AI Forecast (Tomorrow)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <PredictionCard title="Gold Forecast (24K per 10g)" data={predictions?.gold} isGold={true} /> 
            <PredictionCard title="Silver Forecast (per 1kg)" data={predictions?.silver} isGold={false} />
          </div>

          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold">Historical Retail Trends</h2>
            <div className="flex bg-secondary rounded-lg p-1">
              {["1m", "1y", "5y", "30y"].map(range => (
                <button key={range} onClick={() => setTimeRange(range)} className={cn("px-4 py-1 text-sm rounded-md transition-all font-medium", timeRange === range ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>{range.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Gold History (₹ per 10g 24K)" data={getFilteredData(goldHistory)} loading={loadingHistory} color="#eab308" />
            <ChartCard title="Silver History (₹ per 1kg)" data={getFilteredData(silverHistory)} loading={loadingHistory} color="#9ca3af" />      
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
            <button onClick={() => setHiddenNews(new Set([...hiddenNews, ...news.map(n => n.id)]))} className="text-xs px-3 py-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition">Clear All</button>
          </div>
          <div className="grid gap-4">
            {news.filter(n => !hiddenNews.has(n.id)).map((item, idx) => (
              <div key={idx} className="bg-card border border-border/50 rounded-xl p-5 hover:bg-secondary/30 transition flex justify-between items-center gap-4 group">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.publisher} • {item.providerPublishTime}</p>
                </a>
                <button onClick={(e) => { e.preventDefault(); setHiddenNews(new Set([...hiddenNews, item.id])); }} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition rounded-md">✕</button>
              </div>
            ))}
            {news.filter(n => !hiddenNews.has(n.id)).length === 0 && <div className="text-center p-12 text-muted-foreground bg-card border rounded-2xl">You're all caught up! Checking for new updates...</div>}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const PriceCard = ({ title, price, logo }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      {logo}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black tabular-nums">{price ? `₹${price.toLocaleString()}` : '---'}</span>
    </div>
  </motion.div>
);

const PredictionCard = ({ title, data, isGold }: any) => {
  if (!data) return <div className="bg-card border rounded-2xl p-6 h-32 flex items-center justify-center"><LoadingSpinner /></div>;
  const isUp = data.trend === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const displayValue = isGold ? data.predicted_tomorrow_10g_24k : data.predicted_tomorrow_1kg;
  const subtitle = isGold ? `22K: ~ ₹${data.predicted_tomorrow_10g_22k.toLocaleString()} / 10g` : " ";  
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-primary/20 rounded-2xl p-6 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12">
        {isGold ? <GoldLogo /> : <SilverLogo />}
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-4 relative z-10">{title}</h3>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <p className="text-4xl font-extrabold mb-1">₹{displayValue.toLocaleString()}</p>
          {isGold && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="text-right">
          <div className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mb-2", isUp ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
            <Icon className="w-4 h-4" />{data.percent_change}%
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-tighter">Expected Trend</p>
        </div>
      </div>
      <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground relative z-10"><strong>Powered by:</strong> {data.algorithm || "Random Forest ML"}</div>
    </motion.div>
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
