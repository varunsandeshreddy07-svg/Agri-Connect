import { Router, Response } from "express";
import { requireAuth, optionalAuth, AuthRequest } from "../auth.js";
import prisma from "../db.js";

const router = Router();

// GET /api/market/prices — get market ticker prices
router.get("/prices", async (_req: AuthRequest, res: Response) => {
  try {
    let prices = await prisma.marketPrice.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 50,
    });

    // If no prices in DB, return defaults
    if (prices.length === 0) {
      const defaults = [
        { crop: "Basmati Rice (1121)", market: "Karnal Mandi", mandiPrice: 3450, directPrice: 3850, change: "+4.2%", trend: "up", unit: "₹/qtl" },
        { crop: "Sharbati Wheat", market: "Khanna APMC", mandiPrice: 2420, directPrice: 2680, change: "+1.8%", trend: "up", unit: "₹/qtl" },
        { crop: "Red Hybrid Tomato", market: "Nashik Mandi", mandiPrice: 1450, directPrice: 1650, change: "-3.1%", trend: "down", unit: "₹/qtl" },
        { crop: "Salem Turmeric", market: "Erode Yard", mandiPrice: 11800, directPrice: 13200, change: "+8.5%", trend: "up", unit: "₹/qtl" },
        { crop: "Garva Red Onion", market: "Lasalgaon Mandi", mandiPrice: 1980, directPrice: 2250, change: "+5.4%", trend: "up", unit: "₹/qtl" },
        { crop: "Teja Red Chili", market: "Guntur APMC", mandiPrice: 17800, directPrice: 19500, change: "+2.1%", trend: "up", unit: "₹/qtl" },
        { crop: "Yellow Soybean", market: "Indore Mandi", mandiPrice: 4600, directPrice: 4950, change: "+0.5%", trend: "stable", unit: "₹/qtl" },
      ];
      prices = defaults.map((d, i) => ({
        id: String(i + 1),
        ...d,
        fetchedAt: new Date(),
      }));
    }

    res.json({ prices });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch prices." });
  }
});

// GET /api/market/trade-offers — get user's trade offers
router.get("/trade-offers", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const offers = await prisma.tradeOffer.findMany({
      where: {
        OR: [{ buyerId: userId }, { farmerId: userId }],
      },
      include: {
        listing: {
          select: { id: true, title: true, cropName: true, images: { take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ offers });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch trade offers." });
  }
});

// PUT /api/market/trade-offers/:id/status — update offer status
router.put("/trade-offers/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!["accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid status." });
      return;
    }

    const offer = await prisma.tradeOffer.findUnique({ where: { id: req.params.id } });
    if (!offer) {
      res.status(404).json({ error: "Offer not found." });
      return;
    }

    // Only the farmer can accept/decline
    if (offer.farmerId !== req.user!.id) {
      res.status(403).json({ error: "Only the farmer can update offer status." });
      return;
    }

    const updated = await prisma.tradeOffer.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Notify buyer
    await prisma.notification.create({
      data: {
        userId: offer.buyerId,
        type: "offer",
        title: status === "accepted" ? "Your Offer Was Accepted!" : "Your Offer Was Declined",
        message: `Your offer of ₹${offer.proposedPrice}/${offer.unit} for the listing has been ${status}.`,
        linkTo: offer.listingId,
      },
    });

    res.json({ offer: updated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update offer." });
  }
});

export default router;
