import { Router, Request, Response } from "express";
import { registerUser, loginUser, requireAuth, AuthRequest } from "../auth.js";
import prisma from "../db.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, phone, password, name, role, organizationOrFarm, location } = req.body;

    if (!email || !phone || !password || !name) {
      res.status(400).json({ error: "Email, phone, password, and name are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const result = await registerUser(email, phone, password, name, role, {
      organizationOrFarm,
      location,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "Email/phone and password are required." });
      return;
    }

    const result = await loginUser(emailOrPhone, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || "Login failed." });
  }
});

// GET /api/auth/me — get current user profile
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        avatar: true,
        organizationOrFarm: true,
        location: true,
        verificationLevel: true,
        verifiedKyc: true,
        verifiedLand: true,
        verifiedSoil: true,
        verifiedOrganic: true,
        memberSince: true,
        createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// PUT /api/auth/profile — update profile
router.put("/profile", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar, organizationOrFarm, location, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(organizationOrFarm !== undefined && { organizationOrFarm }),
        ...(location !== undefined && { location }),
        ...(phone && { phone }),
      },
      select: {
        id: true, email: true, phone: true, name: true, role: true,
        avatar: true, organizationOrFarm: true, location: true,
        verificationLevel: true,
      },
    });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// PUT /api/auth/verify — upgrade verification level
router.put("/verify", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.body; // land_verified | gold_certified
    if (!["land_verified", "gold_certified"].includes(level)) {
      res.status(400).json({ error: "Invalid verification level." });
      return;
    }

    const updateData: any = { verificationLevel: level };
    if (level === "land_verified") {
      updateData.verifiedKyc = true;
      updateData.verifiedLand = true;
    }
    if (level === "gold_certified") {
      updateData.verifiedKyc = true;
      updateData.verifiedLand = true;
      updateData.verifiedSoil = true;
      updateData.verifiedOrganic = true;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: { id: true, verificationLevel: true, verifiedKyc: true, verifiedLand: true, verifiedSoil: true, verifiedOrganic: true },
    });

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: "Verification update failed." });
  }
});

export default router;
