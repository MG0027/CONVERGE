import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url: `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.connect();

export async function publishOrder(customerId, amount, totalVisits, orderDate) {
  const message = {
    customerId,
    amount,
    totalVisits: totalVisits + 1, 
    lastActive: orderDate  
  };

  await redisClient.publish('order_created', JSON.stringify(message));
}
