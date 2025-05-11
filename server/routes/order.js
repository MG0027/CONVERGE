import express from 'express';
import Order from '../models/order.js';
import Customer from "../models/customer.js";
import { publishOrder } from '../services/orderPub.js';
const router = express.Router();


router.post('/', async (req, res) => {
  const { customerId, amount, discountUsed, paymentMethod, items, channel, orderStatus, shippingAddress, orderDate } = req.body;

  try {
   
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({ message: "Customer not found." });
    }
    
    await publishOrder(customerId, amount, customer.totalVisits,orderDate);
  
    const newOrder = new Order({
      customerId,
      amount,
      discountUsed,
      paymentMethod,
      items,
      channel,
      orderStatus,
      shippingAddress,
      orderDate
    });

    await newOrder.save();


    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId');
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
