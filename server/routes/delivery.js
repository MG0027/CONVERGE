import express from 'express';
import CommunicationLog from '../models/communication.js';

const router = express.Router();


router.post("/receipt", async (req, res) => {
  const { customerId, logId, status } = req.body;

  try {

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
