import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 
import orderRoutes from './routes/order.js';
import customRoutes from './routes/customer.js';
import segmentRoutes from './routes/segments.js';
import vendorRoutes from './routes/vendor.js';
import deliveryRoutes from './routes/delivery.js';
import verfiyRoutes from './routes/verify-token.js';
import { createClient } from 'redis';
import aiRoutes from "./routes/ai-chat.js"
import campaignRoutes from "./routes/campaign.js"
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


const redisClient = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => {
  console.error(" Redis connection error (non-blocking):", err.message);
});

async function initServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected");

    try {
      await redisClient.connect();
      console.log("Redis connected");

     
      await import('./services/orderSub.js');
    } catch (redisErr) {
      console.warn(" Redis not available:", redisErr.message);
      
    }

    app.use(cors());
    app.use(express.json());

   
    app.use('/api/auth', authRoutes);
    app.use('/api/customer', customRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/segments', segmentRoutes);
    app.use("/api/vendor", vendorRoutes);
    app.use("/api/delivery", deliveryRoutes);
    app.use('/api/verify-token', verfiyRoutes);
    app.use('/api/ai',aiRoutes);
    app.use('/api/campaigns', campaignRoutes)
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

initServer();
