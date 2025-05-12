import express from "express";
import Customer from "../models/customer.js";
import CommunicationLog from "../models/communication.js";
import { chatSession } from "../configs/Aimodel.js";

const router = express.Router();


/**
 * @param {{ logic: string, conditions: Array<object> }} node
 * @returns {object} 
 */
function buildMongoQuery(node) {
  if (!node || !Array.isArray(node.conditions)) {
    return {};
  }


  const parts = node.conditions.map(cond => {
    if (cond.logic && Array.isArray(cond.conditions)) {
     
      return buildMongoQuery(cond);
    } else {
    
      return mapConditionToQuery(cond);
    }
  });

  
  if (node.logic === "AND") {
    return { $and: parts };
  }
  if (node.logic === "OR") {
    return { $or: parts };
  }
 
  return { $and: parts };
}

function mapConditionToQuery({ field, operator, value }) {
  switch (operator) {
    case "equals":
    case "=":
      return { [field]: value };
    case "contains":
      return { [field]: { $regex: value, $options: "i" } };
    case "greater_than":
    case ">":
      return { [field]: { $gt: Number(value) } };
    case "less_than":
    case "<":
      return { [field]: { $lt: Number(value) } };
    default:
      return {};
  }
}

function buildMongoQueryFromChainedSegment(node) {
  if (!node) return {};

  
  let resultQuery = null;
  if (node.next) {
    resultQuery = buildMongoQueryFromChainedSegment(node.next);
  }


  const currentConditions = (node.filters || []).map(mapConditionToQuery);

  
  if (resultQuery) {
    const logic = node.logic === "OR" ? "$or" : "$and";
    return {
      [logic]: [
        ...currentConditions,
        resultQuery
      ]
    };
  } else {
   
    if (currentConditions.length === 1) return currentConditions[0];
    return { [node.logic === "OR" ? "$or" : "$and"]: currentConditions };
  }
}


router.get('/preview', async (req, res) => {
  try {
    
    const segment = JSON.parse(req.query.segment || "{}");

    
   const mongoFilter = buildMongoQueryFromChainedSegment(segment);
    
    const count = await Customer.countDocuments(mongoFilter);
    return res.json({ count });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: 'Preview failed' });
  }
});


router.post("/save", async (req, res) => {
  try {
    const { title, segment, count  } = req.body;
    const mongoFilte = buildMongoQueryFromChainedSegment(segment);
    
   

    const log = await CommunicationLog.create({
      title,
      segment,
      count,
      createdAt: new Date(),
      deliveries: []
    });

    
    const mongoFilter = buildMongoQuery(segment);

   
    const customers = await Customer.find(mongoFilter);

      const prompt = `
      You are a friendly marketing assistant.  
      Write a concise SMS (under 50 words) for a campaign titled "${title}".  
      Include a placeholder "{name}" where the customer's name should go.
    `.trim();

    const aiResult = await chatSession.sendMessage(prompt);
    let template = (await aiResult.response.text()).trim();

    
    const deliveries = customers.map(c => ({
      customerId: c._id,
      status: 'PENDING',
       message: template.replace("{name}", c.name)
    }));

    
    log.deliveries = deliveries;
    await log.save();

    
    deliveries.forEach(delivery => {
      fetch("https://convergeb.onrender.com/api/vendor/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: delivery.customerId,
          message: delivery.message,
          logId: log._id,
        }),
      }).catch(err => console.error("Vendor API error:", err));
    });

    return res.status(201).json({
      id: log._id,
      title: log.title,
      createdAt: log.createdAt
    });
  } catch (err) {
    console.error("Error saving segment:", err);
    return res.status(500).json({ error: "Could not save log" });
  }
});

export default router;
