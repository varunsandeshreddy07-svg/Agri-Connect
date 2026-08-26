import { Router, Response } from "express";
import { requireAuth, AuthRequest, optionalAuth } from "../auth.js";
import prisma from "../db.js";

const router = Router();

// GET /api/listings — public, list all available listings with filtering
router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      category,
      state,
      grade,
      organic,
      verified,
      search,
      sort,
      farmerId,
      status = "available",
      page = "1",
      limit = "50",
    } = req.query as Record<string, string>;

    const where: any = {};
    if (status) where.status = status;
    if (category && category !== "All") where.category = category;
    if (state && state !== "All") where.state = state;
    if (grade && grade !== "All") where.grade = grade;
    if (organic === "true") where.isOrganic = true;
    if (verified === "true") {
      where.farmer = { verificationLevel: { in: ["land_verified", "gold_certified"] } };
    }
    if (farmerId) where.farmerId = farmerId;
    if (search) {
      const q = search.toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { cropName: { contains: q } },
        { variety: { contains: q } },
        { location: { contains: q } },
        { state: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_low") orderBy = { pricePerUnit: "asc" };
    else if (sort === "price_high") orderBy = { pricePerUnit: "desc" };
    else if (sort === "quantity_high") orderBy = { quantity: "desc" };

    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * pageSize;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true, name: true, avatar: true, phone: true,
              location: true, verificationLevel: true,
            },
          },
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.listing.count({ where }),
    ]);

    // Parse tags from JSON string
    const formatted = listings.map((l) => ({
      ...l,
      tags: (() => { try { return JSON.parse(l.tags); } catch { return []; } })(),
      images: l.images.map((img) => img.imageUrl),
    }));

    res.json({ listings: formatted, total, page: pageNum, pages: Math.ceil(total / pageSize) });
  } catch (err: any) {
    console.error("Listings fetch error:", err);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

// GET /api/listings/:id — single listing detail
router.get("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true, name: true, avatar: true, phone: true, email: true,
            location: true, verificationLevel: true, verifiedKyc: true,
            verifiedLand: true, verifiedSoil: true, verifiedOrganic: true,
            memberSince: true,
          },
        },
        images: { orderBy: { sortOrder: "asc" } },
        tradeOffers: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!listing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }

    const formatted = {
      ...listing,
      tags: (() => { try { return JSON.parse(listing.tags); } catch { return []; } })(),
      images: listing.images.map((img) => img.imageUrl),
    };

    res.json({ listing: formatted });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch listing." });
  }
});

// POST /api/listings — create new listing (requires auth)
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title, cropName, variety, category, quantity, unit,
      pricePerUnit, mandiBenchmarkPrice, minOrderQuantity,
      harvestDate, location, state, grade, isOrganic,
      organicCertNumber, storageType, moistureContent,
      description, images, tags,
    } = req.body;

    if (!title || !cropName || !quantity || !pricePerUnit) {
      res.status(400).json({ error: "Title, crop name, quantity, and price are required." });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        farmerId: req.user!.id,
        title,
        cropName,
        variety: variety || "",
        category: category || "Grains",
        quantity: parseFloat(quantity) || 0,
        unit: unit || "quintals",
        pricePerUnit: parseFloat(pricePerUnit) || 0,
        mandiBenchmarkPrice: parseFloat(mandiBenchmarkPrice) || 0,
        minOrderQuantity: parseFloat(minOrderQuantity) || 1,
        harvestDate: harvestDate || "",
        location: location || req.user!.location,
        state: state || "",
        grade: grade || "Grade A",
        isOrganic: isOrganic || false,
        organicCertNumber: organicCertNumber || "",
        storageType: storageType || "Dry Ventilated Shed",
        moistureContent: parseFloat(moistureContent) || 12,
        description: description || "",
        tags: JSON.stringify(tags || []),
        // Create images
        images: {
          create: (images || []).map((url: string, i: number) => ({
            imageUrl: url,
            sortOrder: i,
          })),
        },
      },
      include: {
        farmer: { select: { id: true, name: true, avatar: true, phone: true, location: true, verificationLevel: true } },
        images: true,
      },
    });

    const formatted = {
      ...listing,
      tags: (() => { try { return JSON.parse(listing.tags); } catch { return []; } })(),
      images: listing.images.map((img) => img.imageUrl),
    };

    res.json({ listing: formatted });
  } catch (err: any) {
    console.error("Create listing error:", err);
    res.status(500).json({ error: "Failed to create listing." });
  }
});

// PUT /api/listings/:id — update listing
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    if (existing.farmerId !== req.user!.id) {
      res.status(403).json({ error: "You can only edit your own listings." });
      return;
    }

    const data = req.body;
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.cropName) updateData.cropName = data.cropName;
    if (data.variety !== undefined) updateData.variety = data.variety;
    if (data.category) updateData.category = data.category;
    if (data.quantity) updateData.quantity = parseFloat(data.quantity);
    if (data.unit) updateData.unit = data.unit;
    if (data.pricePerUnit) updateData.pricePerUnit = parseFloat(data.pricePerUnit);
    if (data.mandiBenchmarkPrice) updateData.mandiBenchmarkPrice = parseFloat(data.mandiBenchmarkPrice);
    if (data.minOrderQuantity) updateData.minOrderQuantity = parseFloat(data.minOrderQuantity);
    if (data.harvestDate !== undefined) updateData.harvestDate = data.harvestDate;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.grade) updateData.grade = data.grade;
    if (data.isOrganic !== undefined) updateData.isOrganic = data.isOrganic;
    if (data.organicCertNumber !== undefined) updateData.organicCertNumber = data.organicCertNumber;
    if (data.storageType) updateData.storageType = data.storageType;
    if (data.moistureContent) updateData.moistureContent = parseFloat(data.moistureContent);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        farmer: { select: { id: true, name: true, avatar: true, phone: true, location: true, verificationLevel: true } },
        images: true,
      },
    });

    res.json({
      listing: {
        ...updated,
        tags: (() => { try { return JSON.parse(updated.tags); } catch { return []; } })(),
        images: updated.images.map((img) => img.imageUrl),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update listing." });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    if (existing.farmerId !== req.user!.id) {
      res.status(403).json({ error: "You can only delete your own listings." });
      return;
    }
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete listing." });
  }
});

export default router;
