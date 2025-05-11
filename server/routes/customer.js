import express from 'express';
import Customer from '../models/customer.js';

const router = express.Router();


router.post('/', async (req, res) => {
  const { name, email, phone, gender, birthdate, city, preferredChannel, totalSpend, totalVisits, lastActive } = req.body;

  try {
   
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this email already exists." });
    }

   
    const newCustomer = new Customer({
      name,
      email,
      phone,
      gender,
      birthdate,
      city,
      preferredChannel,
      totalSpend,
      totalVisits,
      lastActive
    });

   
    await newCustomer.save();

    res.status(201).json(newCustomer); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
