import jwt from "jsonwebtoken";
import { Router } from "express";
import { prisma } from "../config/db.config";
import { registerSchema } from "../schemas/auth.schema";
import { loginSchema } from "../schemas/auth.schema";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../lib/constants";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET as string);
    res.cookie("token", token);
    return res.status(200).json({ user: user.name });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET as string);
    res.cookie("token", token);
    return res.status(200).json({ user: user.name });
  } catch (error) {
    return res.status(500).json({ error });
  }
});
