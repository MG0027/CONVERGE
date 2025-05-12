# Converge: Mini CRM Platform

Live Demo: https://converge-c6dl.onrender.com

A lightweight, end-to-end CRM that supports customer segmentation, personalized campaign delivery, and AI-powered insights.

---

## 🚀 Features

1. **Data Ingestion APIs**  
   - Secure REST endpoints for Customers & Orders  
   - Validation in API layer; asynchronous persistence via Redis Streams  
2. **Campaign Builder UI**  
   - Dynamic rule builder (AND/OR, spend, visits, inactivity)  
   - Real-time audience size preview  
   - Campaign history with stats 
3. **Campaign Delivery & Logging**  
   - On-save campaign triggers: logs written to `communication_log`  
   - Dummy Vendor API simulates 90% success / 10% failure  
   - Delivery Receipt callback updates log in batches  
4. **Authentication**  
   - Google OAuth 2.0 protection  
   - Only authenticated users can build/view campaigns  
5. **AI Integrations**  
   - **Message Suggestions**: Generates Suggested message based on the campaign title which we send to the customers by replacing their name in it
 

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS  
- **Backend**: Node.js + Express  
- **Database**: MongoDB (Mongoose ODM)  
- **Pub-Sub**: Redis Streams (via `orderPub.js` / `orderSub.js`)  
- **AI**: Gemini API 
- **Auth**: Google OAuth 2.0  

---

## 📦 Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/<your-username>/converge.git
   cd converge
   
2. **Setup environment
Create a .env in /server:
PORT=5000
MONGO_URI=<your-mongo-uri>
REDIS_URL=<your-redis-url>
JWT_SECRET=<your-jwt-secret>
OPENAI_API_KEY=<your-openai-key>

create a .env in /client:
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>

3. **Install & run server
    ```bash
    cd server
    npm install
    npm run dev
    Install & run client

    cd ../client
    npm install
    npm run dev

 Visit http://localhost:5173

## 📐 Architecture

API Layer: Express routes validate

Redis Consumer: Persists to MongoDB

UI: ReactFlow & ShadCN

AI Layer: Gemini calls for message

## 🧠 AI Tools Used
gemini-2.0-flash-exp-image-generation

Campaign message suggestion

(Optional) Future: image APIs for personalized banners

## ⚠️ Known Limitations

Simulated vendor API; real SMS/email provider integration pending

No rate-limiting on ingestion (can flood Redis)

Single-tenant; multi-tenant support to be added



