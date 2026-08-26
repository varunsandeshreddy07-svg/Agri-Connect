import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import prisma from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "agriconnect-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  organizationOrFarm: string;
  location: string;
  verificationLevel: string;
  phone: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare a password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

// Express middleware: require authentication
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Please log in." });
    return;
  }

  const token = authHeader.split(" ")[1];
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    return;
  }

  req.user = user;
  next();
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

// Register a new user
export async function registerUser(
  email: string,
  phone: string,
  password: string,
  name: string,
  role: string = "farmer",
  extra?: { organizationOrFarm?: string; location?: string; avatar?: string }
) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    throw new Error("An account with this email or phone already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      name,
      role,
      organizationOrFarm: extra?.organizationOrFarm || "",
      location: extra?.location || "",
      avatar: extra?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff&size=150`,
    },
  });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    organizationOrFarm: user.organizationOrFarm,
    location: user.location,
    verificationLevel: user.verificationLevel,
    phone: user.phone,
  };

  return { user: authUser, token: generateToken(authUser) };
}

// Login an existing user
export async function loginUser(emailOrPhone: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] },
  });

  if (!user) {
    throw new Error("No account found with this email or phone number.");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("Incorrect password. Please try again.");
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    organizationOrFarm: user.organizationOrFarm,
    location: user.location,
    verificationLevel: user.verificationLevel,
    phone: user.phone,
  };

  return { user: authUser, token: generateToken(authUser) };
}
