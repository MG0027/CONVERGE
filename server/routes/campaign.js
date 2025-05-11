// server/routes/campaign.js
import express from 'express';
import CommunicationLog from '../models/communication.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1) fetch and sort
    const logs = await CommunicationLog
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    // 2) map to only the fields the UI needs
    const campaigns = logs.map(log => {
      const total = log.deliveries.length;
      const sentCount = log.deliveries.filter(d => d.status === 'SENT').length;
      const successRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;
      return {
        id: log._id,
        title: log.title,
        audience: total,
        createdAt: log.createdAt,
        successRate,      // percent: 0–100
      };
    });

    return res.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return res.status(500).json({ error: "Could not fetch campaigns" });
  }
});

export default router;
