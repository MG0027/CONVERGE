
import express from 'express';
import CommunicationLog from '../models/communication.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    
    const logs = await CommunicationLog
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    
    const campaigns = logs.map(log => {
      const total = log.deliveries.length;
      const sentCount = log.deliveries.filter(d => d.status === 'SENT').length;
      const successRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;
      console.log(log.count)
      return {
        id: log._id,
        title: log.title,
        audience: log.count,
        createdAt: log.createdAt,
        successRate,    
      };
    });

    return res.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return res.status(500).json({ error: "Could not fetch campaigns" });
  }
});

export default router;
