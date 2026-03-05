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

def get_latest_data(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period="7d") 
    if hist.empty:
        raise ValueError(f"Failed to fetch recent data for {ticker_symbol}")
    return hist['Close'].values

def get_usd_to_inr():
    try:
        ticker = yf.Ticker("INR=X")
        hist = ticker.history(period="1d")
        if not hist.empty:
            return hist['Close'].values[-1]
    except:
        pass
    return 83.5 

def get_dynamic_gold_multiplier():
    try:
        latest_usd = get_latest_data('GC=F')[-1]
        inr_rate = get_usd_to_inr()
        raw_1g_24k_inr = (latest_usd * inr_rate) / TROY_OUNCE_TO_GRAMS
        return TARGET_1G_24K_INR / raw_1g_24k_inr
    except:
        return 1.25

def convert_prices(price_per_oz_usd, inr_rate, multiplier):
    retail_price_inr_oz = price_per_oz_usd * inr_rate * multiplier
    price_1g_24k = retail_price_inr_oz / TROY_OUNCE_TO_GRAMS
    
    # LIVE TICKING simulation
    tick_noise = random.uniform(-8, 8)
    price_1g_24k += tick_noise
        
    return {
        "price_per_oz": round(price_1g_24k * TROY_OUNCE_TO_GRAMS, 2),
        "price_1g_24k": round(price_1g_24k, 2),
        "price_10g_24k": round(price_1g_24k * 10, 2),
        "price_1g_22k": round(price_1g_24k * 0.916, 2),
        "price_10g_22k": round(price_1g_24k * 0.916 * 10, 2),
        "price_1kg": round(price_1g_24k * 1000, 2),
    }

def convert_silver_prices(price_per_oz_usd, inr_rate):
    retail_price_inr_oz = price_per_oz_usd * inr_rate * SILVER_RETAIL_MULTIPLIER
    price_1g = retail_price_inr_oz / TROY_OUNCE_TO_GRAMS
    silver_tick = random.uniform(-40, 40)
    return {
        "price_per_oz": round(retail_price_inr_oz, 2),
        "price_10g": round(price_1g * 10, 2),
        "price_1kg": round((price_1g * 1000) + silver_tick, 2),
    }

@app.get("/api/current-prices")
async def get_current_prices():
    try:
        gold_latest_usd = get_latest_data('GC=F')[-1]
        silver_latest_usd = get_latest_data('SI=F')[-1]
        inr_rate = get_usd_to_inr()
        return {
            "timestamp": datetime.datetime.now().strftime("%d %b %Y, %I:%M %p"),
            "gold": convert_prices(gold_latest_usd, inr_rate, get_dynamic_gold_multiplier()),
            "silver": convert_silver_prices(silver_latest_usd, inr_rate)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/city-prices")
async def get_city_prices():
    try:
        gold_latest_usd = get_latest_data('GC=F')[-1]
        silver_latest_usd = get_latest_data('SI=F')[-1]
        inr_rate = get_usd_to_inr()
        
        base_gold = convert_prices(gold_latest_usd, inr_rate, get_dynamic_gold_multiplier())
        base_silver = convert_silver_prices(silver_latest_usd, inr_rate)
        
        cities = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Ahmedabad", "Pune"]
        city_data = []
        for city in cities:
            var = random.uniform(-50, 50)
            city_data.append({
                "city": city,
                "gold_10g_24k": round(base_gold["price_10g_24k"] + var),
                "gold_10g_22k": round(base_gold["price_10g_22k"] + var),
                "silver_1kg": round(base_silver["price_1kg"] + (var * 10))
            })
        return city_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news")
async def get_news():
    try:
        url = "https://news.google.com/rss/search?q=gold+silver+price+india+market&hl=en-IN&gl=IN&ceid=IN:en"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            news = []
            for item in root.findall('./channel/item')[:8]:
                title = item.find('title').text
                link = item.find('link').text
                pubDate = item.find('pubDate').text
                source = item.find('source').text if item.find('source') is not None else "Google News"
                clean_title = title.rsplit(" - ", 1)[0] if " - " in title else title
                news.append({
                    "id": link.split("/")[-1][:15] if "/" in link else str(random.randint(1000,9999)),
                    "title": clean_title, "publisher": source, "link": link, "providerPublishTime": pubDate
                })
            return news
    except Exception as e:
        return []

@app.get("/api/historical-data/{asset}")
async def get_historical_data(asset: str):
    if asset.lower() not in ["gold", "silver"]:
        raise HTTPException(status_code=400, detail="Asset must be 'gold' or 'silver'")
    file_path = f"historical_{asset.lower()}.csv"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Historical data not found.")
    try:
        df = pd.read_csv(file_path)
        inr_rate = get_usd_to_inr()
        if asset.lower() == 'gold':
            multiplier = get_dynamic_gold_multiplier()
            df['Price_Graph'] = (df['Price'] * inr_rate * multiplier / TROY_OUNCE_TO_GRAMS * 10).round(2)
        else:
            df['Price_Graph'] = (df['Price'] * inr_rate * SILVER_RETAIL_MULTIPLIER / TROY_OUNCE_TO_GRAMS * 1000).round(2)
        return df[['Date', 'Price_Graph']].rename(columns={'Price_Graph': 'Price'}).to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predict")
async def predict_prices():
    try:
        inr_rate = get_usd_to_inr()
        gold_recent = get_latest_data('GC=F')[-5:]
        raw_gold_pred = gold_model.predict(pd.DataFrame([gold_recent[::-1]], columns=['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']))[0]
        silver_recent = get_latest_data('SI=F')[-5:]
        raw_silver_pred = silver_model.predict(pd.DataFrame([silver_recent[::-1]], columns=['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']))[0]
        
        current_g = gold_recent[-1]
        current_s = silver_recent[-1]
        
        # Bound
        g_diff = raw_gold_pred - current_g
        max_g = current_g * 0.008
        gold_pred_oz = current_g + (max_g if g_diff > max_g else (-max_g if g_diff < -max_g else g_diff))
        
        s_diff = raw_silver_pred - current_s
        max_s = current_s * 0.012
        silver_pred_oz = current_s + (max_s if s_diff > max_s else (-max_s if s_diff < -max_s else s_diff))
        
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
    uvicorn.run(app, host="0.0.0.0", port=8000)