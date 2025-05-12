import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export default router;
