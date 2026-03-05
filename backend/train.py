import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import pickle
import os

def fetch_and_prepare_data(ticker_symbol, name):
    print(f"Fetching historical data for {name} ({ticker_symbol})...")
    ticker = yf.Ticker(ticker_symbol)
    
    # Fetch 30 years of data if available, else max
    hist = ticker.history(period="max") 
    
    if hist.empty:
        raise ValueError(f"Failed to fetch data for {ticker_symbol}")
        
    df = hist[['Close']].copy()
    df.columns = ['Price']
    df.index = df.index.tz_localize(None)
    
    # We create lag features (T-1, T-2, T-3, T-4, T-5) to predict T
    for i in range(1, 6):
        df[f'T_minus_{i}'] = df['Price'].shift(i)
        
    df = df.dropna()
    
    # Save the prepared historical data for the API to serve
    df.reset_index(inplace=True)
    df.to_csv(f'historical_{name.lower()}.csv', index=False)
    print(f"Saved {len(df)} historical records for {name}.")
    
    return df

def train_model(df, name):
    print(f"Training ML model for {name}...")
    X = df[['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']]
    y = df['Price']
    
    # Time-series split (predicting the future based on the past)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, shuffle=False)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    
    print(f"{name} Model Trained. MSE: {mse:.2f}")
    
    # Save model
    with open(f'{name.lower()}_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved {name.lower()}_model.pkl\n")

if __name__ == "__main__":
    try:
        # Gold: GC=F (USD per Troy Ounce)
        gold_df = fetch_and_prepare_data('GC=F', 'Gold')
        train_model(gold_df, 'Gold')
        
        # Silver: SI=F (USD per Troy Ounce)
        silver_df = fetch_and_prepare_data('SI=F', 'Silver')
        train_model(silver_df, 'Silver')
        
        print("Training completed successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")
