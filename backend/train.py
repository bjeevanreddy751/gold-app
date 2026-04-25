import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
import pickle
import os

def fetch_and_prepare_data(ticker_symbol, name):
    print(f"Fetching historical data for {name} ({ticker_symbol})...")
    ticker = yf.Ticker(ticker_symbol)
    
    # Fetch maximum available history for robust training
    hist = ticker.history(period="max") 
    
    if hist.empty:
        raise ValueError(f"Failed to fetch data for {ticker_symbol}")
        
    df = hist[['Close']].copy()
    df.columns = ['Price']
    df.index = df.index.tz_localize(None)
    
    # We create lag features (T-1, T-2, T-3, T-4, T-5) to predict T
    # This matches the signature expected by the backend API.
    for i in range(1, 6):
        df[f'T_minus_{i}'] = df['Price'].shift(i)
        
    df = df.dropna()
    
    # Save the prepared historical data for the API to serve
    df.reset_index(inplace=True)
    df.to_csv(f'historical_{name.lower()}.csv', index=False)
    print(f"Saved {len(df)} historical records for {name}.")
    
    return df

def train_model(df, name):
    print(f"Training Advanced ML Ensemble (Neural Network + Trees) for {name}...")
    X = df[['T_minus_1', 'T_minus_2', 'T_minus_3', 'T_minus_4', 'T_minus_5']]
    y = df['Price']
    
    # Time-series split (predicting the future based on the past)
    # Testing on the most recent 10% of data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, shuffle=False)
    
    # 1. Random Forest (Robust against overfitting, good for general trends)
    rf = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
    
    # 2. Gradient Boosting (Good for picking up subtle patterns)
    gb = GradientBoostingRegressor(n_estimators=150, learning_rate=0.05, max_depth=5, random_state=42)
    
    # 3. Multi-Layer Perceptron (Neural Network - deep learning proxy)
    # Neural Networks require feature scaling
    mlp = Pipeline([
        ('scaler', StandardScaler()),
        ('nn', MLPRegressor(hidden_layer_sizes=(128, 64, 32), max_iter=1000, random_state=42, early_stopping=True))
    ])
    
    # Create the Ensemble
    ensemble = VotingRegressor(estimators=[
        ('rf', rf),
        ('gb', gb),
        ('neural_net', mlp)
    ], weights=[0.4, 0.3, 0.3]) # Weight the models
    
    ensemble.fit(X_train, y_train)
    
    predictions = ensemble.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    mape = mean_absolute_percentage_error(y_test, predictions) * 100
    
    print(f"{name} Ensemble Model Trained.")
    print(f" -> MSE: {mse:.2f}")
    print(f" -> Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
    
    # Save model
    with open(f'{name.lower()}_model.pkl', 'wb') as f:
        pickle.dump(ensemble, f)
    print(f"Saved {name.lower()}_model.pkl\n")

if __name__ == "__main__":
    try:
        # Gold: GC=F (USD per Troy Ounce)
        gold_df = fetch_and_prepare_data('GC=F', 'Gold')
        train_model(gold_df, 'Gold')
        
        # Silver: SI=F (USD per Troy Ounce)
        silver_df = fetch_and_prepare_data('SI=F', 'Silver')
        train_model(silver_df, 'Silver')
        
        print("Ensemble Training completed successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")
