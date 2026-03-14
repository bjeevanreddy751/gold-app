import os
import pickle
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'model.pkl'
DATA_PATH = 'historical_data.csv'

def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            return pickle.load(f)
    return None

model = load_model()

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    try:
        if not os.path.exists(DATA_PATH):
            return jsonify({'error': 'Data file not found'}), 404
        
        df = pd.read_csv(DATA_PATH)
        # Limit to the last 100 entries for better visualization
        df_recent = df.tail(100).copy()
        
        records = df_recent.to_dict(orient='records')
        return jsonify(records)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_gold_price():
    try:
        global model
        if model is None:
            model = load_model()
            if model is None:
                return jsonify({'error': 'Model not trained'}), 500

        data = request.json
        
        # Extract lagged prices
        t_minus_3 = float(data.get('T_minus_3'))
        t_minus_2 = float(data.get('T_minus_2'))
        t_minus_1 = float(data.get('T_minus_1'))
        
        # Make prediction
        input_data = pd.DataFrame([[t_minus_3, t_minus_2, t_minus_1]], columns=['T_minus_3', 'T_minus_2', 'T_minus_1'])
        prediction = model.predict(input_data)[0]
        
        return jsonify({
            'prediction': prediction,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)