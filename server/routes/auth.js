
import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, name, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        uuid: uuidv4(),
        email,
        name,
        picture,
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
