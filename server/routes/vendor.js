import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();


router.post("/send", async (req, res) => {
  const { customerId, message, logId } = req.body;

  const isSuccess = Math.random() < 0.9;
  const status = isSuccess ? "SENT" : "FAILED";

  
  await fetch("https://convergeb.onrender.com/api/delivery/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, logId, status }),
  });

  res.json({ status });
});

export default router;
