from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf 
import pandas as pd
import pickle
import os
import random
import urllib.request
import xml.etree.ElementTree as ET
import datetime
import ssl
from textblob import TextBlob

app = FastAPI(title="BullionPulse AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
try:
    with open('gold_model.pkl', 'rb') as f:
        gold_model = pickle.load(f)
    with open('silver_model.pkl', 'rb') as f:
        silver_model = pickle.load(f)
except FileNotFoundError:
    print("Warning: Models not found. Please run train.py first.")

# USER SPECIFIED PRICE ANCHOR
TARGET_1G_22K_INR = 14980 
TARGET_1G_24K_INR = TARGET_1G_22K_INR / 0.916

TROY_OUNCE_TO_GRAMS = 31.1034768
SILVER_RETAIL_MULTIPLIER = 1.32 

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Simple In-Memory Cache
price_cache = {}
CACHE_EXPIRY_SECONDS = 60 # Cache for 1 minute

def get_latest_data(ticker_symbol):
    now = datetime.datetime.now()
    if ticker_symbol in price_cache:
        cached_data, timestamp = price_cache[ticker_symbol]
        if (now - timestamp).total_seconds() < CACHE_EXPIRY_SECONDS:
            return cached_data

    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period="5d", interval="1m") 
    if hist.empty:
        hist = ticker.history(period="7d")
        if hist.empty:
            raise ValueError(f"Failed to fetch recent data for {ticker_symbol}")
    
    data = hist['Close'].values
    price_cache[ticker_symbol] = (data, now)
    return data

def get_usd_to_inr():
    ticker_symbol = "INR=X"
    now = datetime.datetime.now()
    if ticker_symbol in price_cache:
        cached_rate, timestamp = price_cache[ticker_symbol]
        if (now - timestamp).total_seconds() < CACHE_EXPIRY_SECONDS:
            return cached_rate

    try:
        ticker = yf.Ticker(ticker_symbol)
        hist = ticker.history(period="5d", interval="1m")
        if not hist.empty:
            rate = hist['Close'].values[-1]
            price_cache[ticker_symbol] = (rate, now)
            return rate
    except:
        pass
    return 83.5 

def get_dynamic_gold_multiplier():
    return 1.14  # Approx 14% premium in India (Duty + GST + Local Premium) over spot

def convert_prices(price_per_oz_usd, inr_rate, multiplier):
    retail_price_inr_oz = price_per_oz_usd * inr_rate * multiplier
    price_1g_24k = retail_price_inr_oz / TROY_OUNCE_TO_GRAMS
            
    return {
        "price_per_oz": round(price_1g_24k * TROY_OUNCE_TO_GRAMS, 2),
        "price_1g_24k": round(price_1g_24k, 2),
        "price_10g_24k": round(price_1g_24k * 10, 2),
        "price_1g_22k": round(price_1g_24k * 0.916, 2),
        "price_10g_22k": round(price_1g_24k * 0.916 * 10, 2),
        "price_1kg": round(price_1g_24k * 1000, 2),
    }

def convert_silver_prices(price_per_oz_usd, inr_rate):
    retail_price_inr_oz = price_per_oz_usd * inr_rate * 1.18 # Approx 18% premium in India
    price_1g = retail_price_inr_oz / TROY_OUNCE_TO_GRAMS
    
    return {
        "price_per_oz": round(retail_price_inr_oz, 2),
        "price_10g": round(price_1g * 10, 2),
        "price_1kg": round(price_1g * 1000, 2),
    }

@app.get("/api/current-prices")
async def get_current_prices():
    try:
        # Add random fluctuation to simulate real-time tick data up/down
        gold_latest_usd = get_latest_data('GC=F')[-1] + random.uniform(-1.5, 1.5)
        silver_latest_usd = get_latest_data('SI=F')[-1] + random.uniform(-0.2, 0.2)
        inr_rate = get_usd_to_inr()
        
        # Calculate Shock Level (Simple Z-Score simulation)
        gold_hist = get_latest_data('GC=F')
        gold_std = pd.Series(gold_hist).std()
        gold_mean = pd.Series(gold_hist).mean()
        z_score = abs(gold_latest_usd - gold_mean) / gold_std if gold_std > 0 else 0
        shock_detected = bool(z_score > 2.0)

        return {
            "timestamp": datetime.datetime.now().strftime("%d %b %Y, %I:%M:%S %p"),
            "gold": convert_prices(gold_latest_usd, inr_rate, get_dynamic_gold_multiplier()),
            "silver": convert_silver_prices(silver_latest_usd, inr_rate),
            "shock_alert": {
                "detected": shock_detected,
                "severity": "High" if z_score > 3.0 else "Medium" if z_score > 2.0 else "Low",
                "score": float(round(z_score, 2))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-mood")
async def get_market_mood():
    # Fear & Greed Index logic
    # Volatility (VIX approx), Sentiment, and RSI-like momentum
    try:
        gold_ticker = yf.Ticker('GC=F')
        hist = gold_ticker.history(period="14d")
        
        # Simple RSI logic for "Greed"
        delta = hist['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs.iloc[-1]))
        
        # News Sentiment integration
        news = await get_news()
        sentiment_avg = sum([n['sentiment_score'] for n in news]) / len(news) if news else 50
        
        # Combine into a 0-100 score
        mood_score = round((rsi * 0.6) + (sentiment_avg * 0.4))
        
        status = "Extreme Greed" if mood_score > 80 else "Greed" if mood_score > 60 else "Neutral" if mood_score > 40 else "Fear" if mood_score > 20 else "Extreme Fear"
        
        return {
            "score": mood_score,
            "status": status,
            "rsi": round(rsi, 2),
            "sentiment": round(sentiment_avg, 2),
            "timestamp": datetime.datetime.now().isoformat()
        }
    except:
        return {"score": 55, "status": "Neutral", "rsi": 52, "sentiment": 60}

@app.get("/api/simulator")
async def simulate_price(inflation: float = 0, usd_index: float = 0, demand_spike: float = 0):
    # Base price is current gold 10g 24K
    try:
        gold_latest_usd = get_latest_data('GC=F')[-1]
        inr_rate = get_usd_to_inr()
        base_price = convert_prices(gold_latest_usd, inr_rate, get_dynamic_gold_multiplier())["price_10g_24k"]
        
        # Simulation Logic: 
        # Inflation +1% -> Gold +1.2%
        # USD Index +1% -> Gold -0.8%
        # Demand Spike +1% -> Gold +0.5%
        change_pct = (inflation * 1.2) - (usd_index * 0.8) + (demand_spike * 0.5)
        simulated_price = base_price * (1 + (change_pct / 100))
        
        return {
            "base_price": base_price,
            "simulated_price": round(simulated_price, 2),
            "change_amount": round(simulated_price - base_price, 2),
            "change_pct": round(change_pct, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crisis-tracker")
async def get_crisis_tracker():
    # Mocked data reflecting real-world geopolitical impact
    return [
        {"id": 1, "event": "Middle East Tension", "impact": "+2.4%", "risk_level": "High", "date": "Current"},
        {"id": 2, "event": "Fed Interest Rate Decision", "impact": "-0.5%", "risk_level": "Medium", "date": "Next Week"},
        {"id": 3, "event": "Central Bank Buying (China/India)", "impact": "+1.8%", "risk_level": "Stable", "date": "Ongoing"},
        {"id": 4, "event": "US Inflation Data (CPI)", "impact": "Volatile", "risk_level": "High", "date": "14 March"}
    ]

@app.get("/api/comparison-assets")
async def get_comparison_assets():
    try:
        # Fetch Gold, Silver, and Bitcoin (BTC-USD)
        gold = yf.Ticker('GC=F').history(period="1mo")['Close']
        silver = yf.Ticker('SI=F').history(period="1mo")['Close']
        btc = yf.Ticker('BTC-USD').history(period="1mo")['Close']
        
        # Normalize to 100 for comparison
        normalize = lambda s: ((s / s.iloc[0]) * 100).round(2).tolist()
        dates = gold.index.strftime('%d %b').tolist()
        
        return {
            "dates": dates,
            "gold": normalize(gold),
            "silver": normalize(silver),
            "bitcoin": normalize(btc)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-countdown")
async def get_market_countdown():
    return [
        {"event": "US CPI Inflation Report", "days": 1, "hours": 4, "impact": "Very High"},
        {"event": "Federal Reserve Meeting", "days": 5, "hours": 12, "impact": "Maximum"},
        {"event": "RBI Policy Review", "days": 12, "hours": 0, "impact": "High (INR impact)"},
        {"event": "Global Manufacturing Index", "days": 3, "hours": 8, "impact": "Medium"}
    ]

@app.get("/api/leaderboard")
async def get_leaderboard():
    return [
        {"rank": 1, "name": "BullionWhale", "accuracy": "94.2%", "profit": "+₹4.2L", "badges": ["Verified", "Expert"]},
        {"rank": 2, "name": "GoldDigger_99", "accuracy": "89.5%", "profit": "+₹2.1L", "badges": ["Top Predictor"]},
        {"rank": 3, "name": "MCX_Trader_Jeevan", "accuracy": "88.1%", "profit": "+₹1.8L", "badges": []},
        {"rank": 4, "name": "WealthManager_AI", "accuracy": "85.4%", "profit": "+₹95k", "badges": ["Bot"]},
        {"rank": 5, "name": "SilverSurfer", "accuracy": "82.0%", "profit": "+₹42k", "badges": []}
    ]

@app.get("/api/historical-events")
async def get_historical_events():
    return [
        {"year": 1971, "event": "Nixon Shock (End of Gold Standard)", "impact": "Gold prices surged as USD devalued."},
        {"year": 1999, "event": "Brown Bottom", "impact": "UK sold gold at historical lows, marking a major market floor."},
        {"year": 2008, "event": "Global Financial Crisis", "impact": "Safe haven demand pushed gold to new record highs."},
        {"year": 2011, "event": "Eurozone Debt Crisis", "impact": "Gold reached $1900 peak due to systemic collapse fears."},
        {"year": 2020, "event": "COVID-19 Pandemic", "impact": "Unprecedented stimulus led gold to break $2000 barrier."},
        {"year": 2024, "event": "Central Bank Gold Rush", "impact": "Record purchases by RBI and PBOC sustaining high floors."}
    ]

@app.get("/api/city-prices")
async def get_city_prices():
    try:
        # Add random fluctuation to match the dynamic up/down of main prices
        gold_latest_usd = get_latest_data('GC=F')[-1] + random.uniform(-1.5, 1.5)
        silver_latest_usd = get_latest_data('SI=F')[-1] + random.uniform(-0.2, 0.2)
        inr_rate = get_usd_to_inr()
        
        base_gold = convert_prices(gold_latest_usd, inr_rate, get_dynamic_gold_multiplier())
        base_silver = convert_silver_prices(silver_latest_usd, inr_rate)
        
        city_offsets = {
            "Mumbai": {"gold": 0, "silver": 0},
            "Delhi": {"gold": 150, "silver": 200},
            "Chennai": {"gold": 250, "silver": 300},
            "Kolkata": {"gold": -100, "silver": -100},
            "Bangalore": {"gold": 100, "silver": 150},
            "Hyderabad": {"gold": 120, "silver": 180},
            "Ahmedabad": {"gold": -50, "silver": -50},
            "Pune": {"gold": 10, "silver": 20}
        }
        city_data = []
        for city, offset in city_offsets.items():
            city_data.append({
                "city": city,
                "gold_10g_24k": round(base_gold["price_10g_24k"] + offset["gold"]),
                "gold_10g_22k": round(base_gold["price_10g_22k"] + (offset["gold"] * 0.916)),
                "silver_1kg": round(base_silver["price_1kg"] + offset["silver"])
            })
        return city_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news")
async def get_news():
    try:
        random_str = str(random.randint(1000, 999999))
        
        # News within the last 5 days
        url = f"https://news.google.com/rss/search?q=gold+OR+silver+price+india+when:5d&hl=en-IN&gl=IN&ceid=IN:en&_t={random_str}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            news = []
            
            for item in root.findall('./channel/item')[:12]:
                title = item.find('title').text
                link = item.find('link').text
                pubDate = item.find('pubDate').text
                source = item.find('source').text if item.find('source') is not None else "Google News"
                clean_title = title.rsplit(" - ", 1)[0] if " - " in title else title
                
                blob = TextBlob(clean_title)
                polarity = blob.sentiment.polarity
                if polarity > 0.05:
                    sentiment = "positive"
                    score = round(polarity * 100)
                elif polarity < -0.05:
                    sentiment = "negative"
                    score = round(abs(polarity) * 100)
                else:
                    sentiment = "neutral"
                    score = 0
                
                unique_id = str(random.randint(100000, 999999))
                
                news.append({
                    "id": unique_id,
                    "title": clean_title, 
                    "publisher": source, 
                    "link": link, 
                    "providerPublishTime": pubDate,
                    "sentiment": sentiment,
                    "sentiment_score": score
                })
            return news
    except Exception as e:
        return []

@app.get("/api/market-analytics")
async def get_market_analytics():
    try:
        # 1. Gold-Silver Ratio
        gold_ticker = yf.Ticker('GC=F')
        silver_ticker = yf.Ticker('SI=F')
        
        g_price = gold_ticker.history(period="1d")['Close'].iloc[-1]
        s_price = silver_ticker.history(period="1d")['Close'].iloc[-1]
        gs_ratio = round(g_price / s_price, 2)

        # 2. Support & Resistance (Pivot Points)
        # Using last 30 days for levels
        hist_g = gold_ticker.history(period="30d")
        high = hist_g['High'].max()
        low = hist_g['Low'].min()
        close = hist_g['Close'].iloc[-1]
        
        # Simple Pivot Calculation
        pivot = (high + low + close) / 3
        r1 = (2 * pivot) - low
        s1 = (2 * pivot) - high
        
        inr_rate = get_usd_to_inr()
        multiplier = get_dynamic_gold_multiplier()
        to_inr_10g = lambda x: round(x * inr_rate * multiplier / TROY_OUNCE_TO_GRAMS * 10)

        # Support & Resistance for Silver
        hist_s = silver_ticker.history(period="30d")
        high_s = hist_s['High'].max()
        low_s = hist_s['Low'].min()
        close_s = hist_s['Close'].iloc[-1]
        
        pivot_s = (high_s + low_s + close_s) / 3
        r1_s = (2 * pivot_s) - low_s
        s1_s = (2 * pivot_s) - high_s
        
        to_inr_silver_1kg = lambda x: round(x * inr_rate * 1.18 / TROY_OUNCE_TO_GRAMS * 1000)

        # 3. Macro Correlation (Mocked logic for speed, but based on real symbols)
        # In a real app, we'd fetch ^NSEI and INR=X history and use .corr()
        correlations = {
            "USD_INR": 0.85,
            "NIFTY_50": -0.45,
            "US_TREASURY": -0.72,
            "CRUDE_OIL": 0.61
        }

        # 4. Seasonal Heatmap (Historical Monthly Averages)
        seasonal_data = [
            {"month": "Jan", "return": 1.2}, {"month": "Feb", "return": -0.5},
            {"month": "Mar", "return": 0.8}, {"month": "Apr", "return": 2.1},
            {"month": "May", "return": 1.5}, {"month": "Jun", "return": -1.1},
            {"month": "Jul", "return": 0.4}, {"month": "Aug", "return": 3.2},
            {"month": "Sep", "return": 4.5}, {"month": "Oct", "return": 2.8},
            {"month": "Nov", "return": 3.5}, {"month": "Dec", "return": 1.9}
        ]

        # 5. AI Summary (TL;DR) dynamically changes based on volatility and current live values
        market_mood = "Bullish" if close > pivot else "Neutral" if abs(close - pivot) < (pivot * 0.005) else "Bearish"
        
        g_current = to_inr_10g(close)
        s_current = to_inr_silver_1kg(close_s)

        summaries = [
            f"At ₹{g_current:,}, Gold is trading {market_mood} above its monthly pivot. The GSR at {gs_ratio} suggests silver at ₹{s_current:,} is relatively {'undervalued' if gs_ratio > 80 else 'fairly priced'}. Resistance at ₹{to_inr_10g(r1):,}.",
            f"Market momentum is {market_mood.lower()} with Gold at ₹{g_current:,}. The Gold-Silver ratio is {gs_ratio}. Watching the ₹{to_inr_10g(pivot):,} pivot for breakouts. Silver is steady at ₹{s_current:,}.",
            f"AI models detect {market_mood.lower()} sentiment. Gold support holds at ₹{to_inr_10g(s1):,} while Silver trades at ₹{s_current:,}. GSR ({gs_ratio}) indicates silver remains a strong diversification play.",
            f"Gold (₹{g_current:,}) and Silver (₹{s_current:,}) are showing {market_mood.lower()} signs. Technical pivot stands at ₹{to_inr_10g(pivot):,}. Market mood is currently focused on inflation hedges.",
            f"Bullion report: Gold ₹{g_current:,}, Silver ₹{s_current:,}. The current ratio of {gs_ratio} signals a {market_mood.lower()} outlook for the week. Investors are maintaining ₹{to_inr_10g(s1):,} as a critical stop-loss floor.",
            f"With Nifty correlation at {correlations['NIFTY_50']}, Gold ₹{g_current:,} is acting as a { 'strong hedge' if market_mood == 'Bullish' else 'stable asset' }. Silver ratio {gs_ratio} favors long-term accumulation."
        ]
        
        today_date = datetime.datetime.now()
        
        return {
            "gs_ratio": gs_ratio,
            "support_resistance": {
                "pivot": to_inr_10g(pivot),
                "resistance": to_inr_10g(r1),
                "support": to_inr_10g(s1),
                "silver_pivot": to_inr_silver_1kg(pivot_s),
                "silver_resistance": to_inr_silver_1kg(r1_s),
                "silver_support": to_inr_silver_1kg(s1_s)
            },
            "correlations": correlations,
            "seasonal_heatmap": seasonal_data,
            "ai_summary": random.choice(summaries),
            "institutional_activity": [
                {"date": today_date.strftime("%d %b"), "event": "RBI hints at maintaining gold reserves", "impact": "Positive"},
                {"date": (today_date - datetime.timedelta(days=2)).strftime("%d %b"), "event": "China PBOC paused purchases for 2nd month", "impact": "Neutral"},
                {"date": (today_date - datetime.timedelta(days=4)).strftime("%d %b"), "event": "Global ETFs see net inflow of 15 tonnes", "impact": "High"}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat")
async def chat_with_ai(query: str):
    try:
        q = query.lower().strip()
        
        # 1. Market Status & Prices
        if any(x in q for x in ["price", "rate", "cost", "value"]):
            if "gold" in q:
                return {"response": "Gold prices are currently determined by international spot rates and local Indian taxes. You can find the live 24K and 22K rates at the top of our dashboard!"}
            if "silver" in q:
                return {"response": "Silver is trading based on industrial demand and safe-haven buying. Check our 'Silver (per 1kg)' card for the most accurate live price."}
            return {"response": "Bullion prices (Gold and Silver) are updating live every 10 seconds on our dashboard. We track 24K, 22K Gold and 1kg Silver rates."}

        # 2. AI & Predictions
        if any(x in q for x in ["predict", "tomorrow", "future", "forecast", "forecast"]):
            return {"response": "Our AI uses a Random Forest Regressor trained on 30 years of historical data. It analyzes recent volatility to forecast tomorrow's opening range. Check the 'AI Forecast' section for exact numbers!"}

        # 3. Investment Advice (Fintech)
        if any(x in q for x in ["invest", "buy", "sgb", "digital", "etf"]):
            if "sgb" in q or "bond" in q:
                return {"response": "Sovereign Gold Bonds (SGBs) are excellent for long-term investors as they offer a 2.5% annual interest and are exempt from Capital Gains tax if held until maturity."}
            if "digital" in q:
                return {"response": "Digital Gold allows you to buy 24K gold for as little as ₹10. It's highly liquid and stored in secure vaults by providers like SafeGold or MMTC-PAMP."}
            return {"response": "For safety, gold is a great long-term hedge. You can explore Physical Gold, SGBs, or Digital Gold depending on your liquidity needs. Check our 'Where to Buy' tab!"}

        # 4. Technical Analysis
        if any(x in q for x in ["ratio", "gsr", "support", "resistance", "pivot", "level"]):
            if "ratio" in q or "gsr" in q:
                return {"response": "The Gold-Silver Ratio (GSR) measures how many ounces of silver it takes to buy one ounce of gold. A high ratio (>80) often suggests silver is undervalued."}
            return {"response": "Our AI calculates Support (Floor) and Resistance (Ceiling) levels daily. These help you identify when the market is overbought or oversold. See the 'AI Key Levels' card on the dashboard."}

        # 5. Taxes & Regulation
        if any(x in q for x in ["tax", "gst", "duty", "capital gain"]):
            return {"response": "In India, bullion carries a 3% GST. For investments, Long-Term Capital Gains (LTCG) tax is 20% with indexation after 3 years. Short-term gains are taxed at your slab rate."}

        # 6. Location & Cities
        if "city" in q or any(city.lower() in q for city in ["mumbai", "delhi", "bangalore", "chennai", "kolkata"]):
            return {"response": "Gold rates vary by city due to local transportation costs and state-level taxes. Click our 'City Prices' tab to see the latest rates for 8 major Indian hubs."}

        # 7. Calculator & Portfolio
        if "portfolio" in q or "track" in q:
            return {"response": "You can use our 'My Portfolio' tab to add your holdings and track your live Profit/Loss. You can also save items directly from the 'Jewellery Calculator'."}
        if "calculator" in q:
            return {"response": "Our 'Jewellery Calculator' helps you find the total cost of an item including weight, purity, making charges, and GST. It's the most accurate tool for buyers."}

        # 8. Greetings & General
        if any(x in q for x in ["hi", "hello", "hey", "who are you", "what can you do"]):
            return {"response": "Hello! I am the BullionPulse AI Assistant. I can answer questions about live prices, AI predictions, market analytics, taxes in India, or help you with our tools like the Portfolio and Calculator. What's on your mind?"}

        # 9. Sentiment & News
        if "news" in q or "sentiment" in q:
            return {"response": "We perform real-time NLP sentiment analysis on market news. Headlines marked 'POSITIVE' usually indicate bullish momentum for prices."}

        # Default Fallback for "All Questions"
        return {"response": f"I see you're asking about '{query}'. While I'm specialized in bullion markets, I can confirm that tracking gold and silver is vital for a diversified portfolio. Could you clarify if you want to know about prices, AI predictions, or investment tools?"}
    except Exception as e:
        return {"response": "I'm experiencing a temporary market-data sync issue. Please ask again in a moment!"}

@app.get("/api/historical-data/{asset}")
async def get_historical_data(asset: str):
    if asset.lower() not in ["gold", "silver"]:
        raise HTTPException(status_code=400, detail="Asset must be 'gold' or 'silver'")
    try:
        symbol = 'GC=F' if asset.lower() == 'gold' else 'SI=F'
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="3mo", interval="1d")
        
        inr_rate = get_usd_to_inr()
        
        if asset.lower() == 'gold':
            multiplier = get_dynamic_gold_multiplier()
            hist['Price'] = (hist['Close'] * inr_rate * multiplier / TROY_OUNCE_TO_GRAMS * 10).round(2)
            # Add dynamic fluctuation to the very last point (today) to make the graph tick live
            hist.iloc[-1, hist.columns.get_loc('Price')] += random.uniform(-150.0, 150.0) 
        else:
            hist['Price'] = (hist['Close'] * inr_rate * 1.18 / TROY_OUNCE_TO_GRAMS * 1000).round(2)
            hist.iloc[-1, hist.columns.get_loc('Price')] += random.uniform(-200.0, 200.0)
            
        hist.reset_index(inplace=True)
        date_col = 'Date' if 'Date' in hist.columns else 'Datetime'
        hist['Date_Str'] = hist[date_col].dt.strftime('%Y-%m-%d')
        
        return hist[['Date_Str', 'Price']].rename(columns={'Date_Str': 'Date'}).to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predict")
async def predict_prices():
    try:
        inr_rate = get_usd_to_inr()
        
        # Add random fluctuation to recent data to make predictions dynamic
        gold_recent = list(get_latest_data('GC=F')[-5:])
        gold_recent[-1] += random.uniform(-1.5, 1.5)
        
        raw_gold_pred = gold_model.predict(pd.DataFrame([gold_recent[::-1]], columns=['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']))[0]
        
        silver_recent = list(get_latest_data('SI=F')[-5:])
        silver_recent[-1] += random.uniform(-0.2, 0.2)
        
        raw_silver_pred = silver_model.predict(pd.DataFrame([silver_recent[::-1]], columns=['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']))[0]
        
        current_g = gold_recent[-1]
        current_s = silver_recent[-1]
        
        # Bound based on standard deviation or a more realistic market fluctuation limit
        g_diff = raw_gold_pred - current_g
        # Gold can easily move 1-2% a day
        max_g = current_g * 0.02
        gold_pred_oz = current_g + (max_g if g_diff > max_g else (-max_g if g_diff < -max_g else g_diff)) + random.uniform(-1.0, 1.0)
        
        s_diff = raw_silver_pred - current_s
        # Silver is more volatile, can move 2-4% a day
        max_s = current_s * 0.03
        silver_pred_oz = current_s + (max_s if s_diff > max_s else (-max_s if s_diff < -max_s else s_diff)) + random.uniform(-0.15, 0.15)
        
        gold_retail = convert_prices(gold_pred_oz, inr_rate, get_dynamic_gold_multiplier())
        silver_retail = convert_silver_prices(silver_pred_oz, inr_rate)
        
        return {
            "gold": {
                "predicted_tomorrow_10g_24k": gold_retail["price_10g_24k"],
                "predicted_tomorrow_10g_22k": gold_retail["price_10g_22k"],
                "trend": "up" if gold_pred_oz > current_g else "down",
                "percent_change": round(((gold_pred_oz - current_g)/current_g)*100, 2),
                "algorithm": "Random Forest Regressor"
            },
            "silver": {
                "predicted_tomorrow_1kg": silver_retail["price_1kg"],
                "trend": "up" if silver_pred_oz > current_s else "down",
                "percent_change": round(((silver_pred_oz - current_s)/current_s)*100, 2),
                "algorithm": "Random Forest Regressor"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)