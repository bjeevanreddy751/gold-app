# Gold & Silver Price Prediction System - Deployment Guide

This project consists of two parts: a FastAPI Python Backend and a Next.js Frontend. Both are designed to be easily deployed to modern cloud platforms.

## 1. Backend Deployment (Render or Railway)

We recommend deploying the backend to **Render** or **Railway** as they have native support for Python FastAPI.

### Steps for Render:
1. Push your repository to GitHub.
2. Create a new **Web Service** on Render.com.
3. Connect your GitHub repository.
4. Set the following details:
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt && python train.py` (This ensures models are trained before starting).
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.

## 2. Frontend Deployment (Vercel)

We recommend deploying the Next.js frontend to **Vercel**, which is created by the makers of Next.js and requires zero configuration.

### Steps for Vercel:
1. Make sure your latest code is pushed to GitHub.
2. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. If your frontend is inside a folder named `frontend`, set the **Root Directory** in Vercel to `frontend`.
5. Under Environment Variables, add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `<YOUR_RENDER_BACKEND_URL>/api` (Replace with the URL you got from Render).
   *Note: In the current code, `API_BASE_URL` in `app/page.tsx` is hardcoded to `http://127.0.0.1:8000/api` for local development. You should update this to use `process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"` before deploying.*
6. Click **Deploy**.

## Additional Notes
- The models use 30 years of historical data retrieved securely on build using `yfinance`.
- The real-time pricing works dynamically via the deployed Python backend.
