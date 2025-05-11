import { createClient } from 'redis';
import Customer from '../models/customer.js';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
  url:`redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.connect();


redisClient.subscribe('order_created', async (message) => {
  try {
    const data = JSON.parse(message);
    const { customerId, amount, totalVisits, lastActive } = data;


    const customer = await Customer.findById(customerId);
    if (!customer) {
      console.error(`Customer with ID ${customerId} not found.`);
      return;
    }

    customer.totalSpend += amount;
    customer.totalVisits = totalVisits;
    customer.lastActive = lastActive;

    await customer.save();
    console.log(`Customer ${customerId} updated successfully!`);
  } catch (error) {
    console.error('Error processing order update:', error.message);
  }
});
