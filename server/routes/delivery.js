import express from 'express';
import CommunicationLog from '../models/communication.js';

const router = express.Router();

// Delivery Receipt: Updates delivery status in the communication log
router.post("/receipt", async (req, res) => {
  const { customerId, logId, status } = req.body;

  try {
    // Update the delivery status for the customer in the communication log
    await CommunicationLog.updateOne(
      { _id: logId, "deliveries.customerId": customerId },
      { $set: { "deliveries.$.status": status } }
    );

    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    console.error("Error updating receipt:", err);
    res.status(500).json({ error: "Could not update delivery status" });
  }
});

export default router;
