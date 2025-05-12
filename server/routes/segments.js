import express from "express";
import Customer from "../models/customer.js";
import CommunicationLog from "../models/communication.js";
import { chatSession } from "../configs/Aimodel.js";

const router = express.Router();

// Maps a single filter leaf to a Mongo predicate
// const mapConditionToQuery = ({ field, operator, value }) => {
//   switch (operator) {
//     case "equals":
//     case "=":
//       return { [field]: value };
//     case "contains":
//       return { [field]: { $regex: value, $options: "i" } };
//     case "greater_than":
//     case ">":
//       return { [field]: { $gt: Number(value) } };
//     case "less_than":
//     case "<":
//       return { [field]: { $lt: Number(value) } };
//     default:
//       return {};
//   }
// };

/**
 * Recursively converts a nested segment node into a MongoDB filter.
 * @param {{ logic: string, conditions: Array<object> }} node
 * @returns {object} MongoDB query fragment
 */
function buildMongoQuery(node) {
  if (!node || !Array.isArray(node.conditions)) {
    return {};
  }

  // Transform each condition: either a leaf or a subtree
  const parts = node.conditions.map(cond => {
    if (cond.logic && Array.isArray(cond.conditions)) {
      // subtree → recurse
      return buildMongoQuery(cond);
    } else {
      // leaf filter
      return mapConditionToQuery(cond);
    }
  });

  // Wrap in $and or $or
  if (node.logic === "AND") {
    return { $and: parts };
  }
  if (node.logic === "OR") {
    return { $or: parts };
  }
  // Fallback: treat as AND
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

  // 1. Evaluate deepest `next` first
  let resultQuery = null;
  if (node.next) {
    resultQuery = buildMongoQueryFromChainedSegment(node.next);
  }

  // 2. Evaluate current filters
  const currentConditions = (node.filters || []).map(mapConditionToQuery);

  // 3. Combine current with result of next
  if (resultQuery) {
    const logic = node.logic === "OR" ? "$or" : "$and";
    return {
      [logic]: [
        ...currentConditions,
        resultQuery
      ]
    };
  } else {
    // Base case
    if (currentConditions.length === 1) return currentConditions[0];
    return { [node.logic === "OR" ? "$or" : "$and"]: currentConditions };
  }
}

// GET /preview — works against Customer, returns co
router.get('/preview', async (req, res) => {
  try {
    console.log("Incoming segment:", req.query.segment);
    const segment = JSON.parse(req.query.segment || "{}");

    // Build our Mongo predicate
   const mongoFilter = buildMongoQueryFromChainedSegment(segment);
    console.log(mongoFilter);
    const count = await Customer.countDocuments(mongoFilter);
    return res.json({ count });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: 'Preview failed' });
  }
});

// POST /save — saves log and populates deliveries based on nested segmen n
router.post("/save", async (req, res) => {
  try {
    const { title, segment } = req.body;

    // 1) Save the log skeleton
    const log = await CommunicationLog.create({
      title,
      segment,
      createdAt: new Date(),
      deliveries: []
    });

    // 2) Build the Mongo query from the nested tree
    const mongoFilter = buildMongoQuery(segment);

    // 3) Find matching customers
    const customers = await Customer.find(mongoFilter);

      const prompt = `
      You are a friendly marketing assistant.  
      Write a concise SMS (under 50 words) for a campaign titled "${title}".  
      Include a placeholder "{name}" where the customer's name should go.
    `.trim();

    const aiResult = await chatSession.sendMessage(prompt);
    let template = (await aiResult.response.text()).trim();

    // 4) Create delivery entries
    const deliveries = customers.map(c => ({
      customerId: c._id,
      status: 'PENDING',
       message: template.replace("{name}", c.name)
    }));

    // 5) Attach and save
    log.deliveries = deliveries;
    await log.save();

    // 6) Fire off vendor calls
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
