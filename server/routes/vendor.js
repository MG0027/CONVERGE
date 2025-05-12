import express from 'express';
import fetch from 'node-fetch'; // Optional, if using Node.js versions <= 16
const router = express.Router();

// Simulate vendor delivery with ~90% success rate
router.post("/send", async (req, res) => {
  const { customerId, message, logId } = req.body;

  const isSuccess = Math.random() < 0.9; // 90% success rate
  const status = isSuccess ? "SENT" : "FAILED";

  // Simulate hitting the Delivery Receipt API
  await fetch("https://convergeb.onrender.com/api/delivery/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, logId, status }),
  });

  res.json({ status });
});

export default router;
