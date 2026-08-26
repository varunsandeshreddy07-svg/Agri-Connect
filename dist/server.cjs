var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express9 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// src/server/routes/auth.ts
var import_express = require("express");

// src/server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// src/server/db.ts
var import_client = require("@prisma/client");
var prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new import_client.PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new import_client.PrismaClient();
  }
  prisma = global.__prisma;
}
var db_default = prisma;

// src/server/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "agriconnect-secret-key-change-in-production";
var JWT_EXPIRES_IN = "7d";
async function hashPassword(password) {
  return import_bcryptjs.default.hash(password, 12);
}
async function comparePassword(password, hash) {
  return import_bcryptjs.default.compare(password, hash);
}
function generateToken(user) {
  return import_jsonwebtoken.default.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return import_jsonwebtoken.default.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function requireAuth(req, res, next) {
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
function optionalAuth(req, _res, next) {
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
async function registerUser(email, phone, password, name, role = "farmer", extra) {
  const existing = await db_default.user.findFirst({
    where: { OR: [{ email }, { phone }] }
  });
  if (existing) {
    throw new Error("An account with this email or phone already exists.");
  }
  const passwordHash = await hashPassword(password);
  const user = await db_default.user.create({
    data: {
      email,
      phone,
      passwordHash,
      name,
      role,
      organizationOrFarm: extra?.organizationOrFarm || "",
      location: extra?.location || "",
      avatar: extra?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff&size=150`
    }
  });
  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    organizationOrFarm: user.organizationOrFarm,
    location: user.location,
    verificationLevel: user.verificationLevel,
    phone: user.phone
  };
  return { user: authUser, token: generateToken(authUser) };
}
async function loginUser(emailOrPhone, password) {
  const user = await db_default.user.findFirst({
    where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] }
  });
  if (!user) {
    throw new Error("No account found with this email or phone number.");
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("Incorrect password. Please try again.");
  }
  const authUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    organizationOrFarm: user.organizationOrFarm,
    location: user.location,
    verificationLevel: user.verificationLevel,
    phone: user.phone
  };
  return { user: authUser, token: generateToken(authUser) };
}

// src/server/routes/auth.ts
var router = (0, import_express.Router)();
router.post("/register", async (req, res) => {
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
      location
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "Email/phone and password are required." });
      return;
    }
    const result = await loginUser(emailOrPhone, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message || "Login failed." });
  }
});
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await db_default.user.findUnique({
      where: { id: req.user.id },
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
        createdAt: true
      }
    });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, avatar, organizationOrFarm, location, phone } = req.body;
    const user = await db_default.user.update({
      where: { id: req.user.id },
      data: {
        ...name && { name },
        ...avatar && { avatar },
        ...organizationOrFarm !== void 0 && { organizationOrFarm },
        ...location !== void 0 && { location },
        ...phone && { phone }
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        avatar: true,
        organizationOrFarm: true,
        location: true,
        verificationLevel: true
      }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});
router.put("/verify", requireAuth, async (req, res) => {
  try {
    const { level } = req.body;
    if (!["land_verified", "gold_certified"].includes(level)) {
      res.status(400).json({ error: "Invalid verification level." });
      return;
    }
    const updateData = { verificationLevel: level };
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
    const user = await db_default.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, verificationLevel: true, verifiedKyc: true, verifiedLand: true, verifiedSoil: true, verifiedOrganic: true }
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Verification update failed." });
  }
});
var auth_default = router;

// src/server/routes/listings.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get("/", optionalAuth, async (req, res) => {
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
      limit = "50"
    } = req.query;
    const where = {};
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
        { tags: { contains: q } }
      ];
    }
    let orderBy = { createdAt: "desc" };
    if (sort === "price_low") orderBy = { pricePerUnit: "asc" };
    else if (sort === "price_high") orderBy = { pricePerUnit: "desc" };
    else if (sort === "quantity_high") orderBy = { quantity: "desc" };
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * pageSize;
    const [listings, total] = await Promise.all([
      db_default.listing.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              phone: true,
              location: true,
              verificationLevel: true
            }
          },
          images: { orderBy: { sortOrder: "asc" } }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      db_default.listing.count({ where })
    ]);
    const formatted = listings.map((l) => ({
      ...l,
      tags: (() => {
        try {
          return JSON.parse(l.tags);
        } catch {
          return [];
        }
      })(),
      images: l.images.map((img) => img.imageUrl)
    }));
    res.json({ listings: formatted, total, page: pageNum, pages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error("Listings fetch error:", err);
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});
router2.get("/:id", optionalAuth, async (req, res) => {
  try {
    const listing = await db_default.listing.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            location: true,
            verificationLevel: true,
            verifiedKyc: true,
            verifiedLand: true,
            verifiedSoil: true,
            verifiedOrganic: true,
            memberSince: true
          }
        },
        images: { orderBy: { sortOrder: "asc" } },
        tradeOffers: { orderBy: { createdAt: "desc" }, take: 10 }
      }
    });
    if (!listing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    const formatted = {
      ...listing,
      tags: (() => {
        try {
          return JSON.parse(listing.tags);
        } catch {
          return [];
        }
      })(),
      images: listing.images.map((img) => img.imageUrl)
    };
    res.json({ listing: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listing." });
  }
});
router2.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      cropName,
      variety,
      category,
      quantity,
      unit,
      pricePerUnit,
      mandiBenchmarkPrice,
      minOrderQuantity,
      harvestDate,
      location,
      state,
      grade,
      isOrganic,
      organicCertNumber,
      storageType,
      moistureContent,
      description,
      images,
      tags
    } = req.body;
    if (!title || !cropName || !quantity || !pricePerUnit) {
      res.status(400).json({ error: "Title, crop name, quantity, and price are required." });
      return;
    }
    const listing = await db_default.listing.create({
      data: {
        farmerId: req.user.id,
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
        location: location || req.user.location,
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
          create: (images || []).map((url, i) => ({
            imageUrl: url,
            sortOrder: i
          }))
        }
      },
      include: {
        farmer: { select: { id: true, name: true, avatar: true, phone: true, location: true, verificationLevel: true } },
        images: true
      }
    });
    const formatted = {
      ...listing,
      tags: (() => {
        try {
          return JSON.parse(listing.tags);
        } catch {
          return [];
        }
      })(),
      images: listing.images.map((img) => img.imageUrl)
    };
    res.json({ listing: formatted });
  } catch (err) {
    console.error("Create listing error:", err);
    res.status(500).json({ error: "Failed to create listing." });
  }
});
router2.put("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await db_default.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    if (existing.farmerId !== req.user.id) {
      res.status(403).json({ error: "You can only edit your own listings." });
      return;
    }
    const data = req.body;
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.cropName) updateData.cropName = data.cropName;
    if (data.variety !== void 0) updateData.variety = data.variety;
    if (data.category) updateData.category = data.category;
    if (data.quantity) updateData.quantity = parseFloat(data.quantity);
    if (data.unit) updateData.unit = data.unit;
    if (data.pricePerUnit) updateData.pricePerUnit = parseFloat(data.pricePerUnit);
    if (data.mandiBenchmarkPrice) updateData.mandiBenchmarkPrice = parseFloat(data.mandiBenchmarkPrice);
    if (data.minOrderQuantity) updateData.minOrderQuantity = parseFloat(data.minOrderQuantity);
    if (data.harvestDate !== void 0) updateData.harvestDate = data.harvestDate;
    if (data.location !== void 0) updateData.location = data.location;
    if (data.state !== void 0) updateData.state = data.state;
    if (data.grade) updateData.grade = data.grade;
    if (data.isOrganic !== void 0) updateData.isOrganic = data.isOrganic;
    if (data.organicCertNumber !== void 0) updateData.organicCertNumber = data.organicCertNumber;
    if (data.storageType) updateData.storageType = data.storageType;
    if (data.moistureContent) updateData.moistureContent = parseFloat(data.moistureContent);
    if (data.description !== void 0) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    const updated = await db_default.listing.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        farmer: { select: { id: true, name: true, avatar: true, phone: true, location: true, verificationLevel: true } },
        images: true
      }
    });
    res.json({
      listing: {
        ...updated,
        tags: (() => {
          try {
            return JSON.parse(updated.tags);
          } catch {
            return [];
          }
        })(),
        images: updated.images.map((img) => img.imageUrl)
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update listing." });
  }
});
router2.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existing = await db_default.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Listing not found." });
      return;
    }
    if (existing.farmerId !== req.user.id) {
      res.status(403).json({ error: "You can only delete your own listings." });
      return;
    }
    await db_default.listing.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete listing." });
  }
});
var listings_default = router2;

// src/server/routes/messages.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get("/conversations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const participations = await db_default.conversationUser.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            users: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true, role: true, verificationLevel: true, phone: true, location: true }
                }
              }
            },
            messages: { orderBy: { createdAt: "desc" }, take: 1 }
          }
        }
      },
      orderBy: { conversation: { updatedAt: "desc" } }
    });
    const conversations = participations.map((p) => {
      const conv = p.conversation;
      const otherParty = conv.users.find((u) => u.userId !== userId);
      const lastMsg = conv.messages[0] || null;
      return {
        id: conv.id,
        otherParty: otherParty?.user || null,
        lastMessage: lastMsg?.text || "No messages yet",
        lastMessageTime: lastMsg ? formatTime(lastMsg.createdAt) : "",
        unreadCount: p.unreadCount,
        messages: []
        // Messages loaded separately
      };
    });
    res.json({ conversations });
  } catch (err) {
    console.error("Conversations fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
});
router3.post("/conversations", requireAuth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      res.status(400).json({ error: "Recipient ID is required." });
      return;
    }
    const userId = req.user.id;
    const existingParticipation = await db_default.conversationUser.findFirst({
      where: {
        userId,
        conversation: {
          users: { some: { userId: recipientId } }
        }
      },
      include: { conversation: true }
    });
    if (existingParticipation) {
      res.json({ conversationId: existingParticipation.conversationId });
      return;
    }
    const conversation = await db_default.conversation.create({
      data: {
        users: {
          create: [
            { userId, unreadCount: 0 },
            { userId: recipientId, unreadCount: 0 }
          ]
        }
      }
    });
    res.json({ conversationId: conversation.id });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation." });
  }
});
router3.get("/conversations/:id", requireAuth, async (req, res) => {
  try {
    const convId = req.params.id;
    const userId = req.user.id;
    const membership = await db_default.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId: convId, userId } }
    });
    if (!membership) {
      res.status(403).json({ error: "Access denied." });
      return;
    }
    await db_default.conversationUser.update({
      where: { conversationId_userId: { conversationId: convId, userId } },
      data: { unreadCount: 0 }
    });
    await db_default.message.updateMany({
      where: { conversationId: convId, recipientId: userId, read: false },
      data: { read: true }
    });
    const messages = await db_default.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } }
      }
    });
    const formatted = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderRole: m.sender.role,
      recipientId: m.recipientId,
      text: m.text,
      timestamp: formatTime(m.createdAt),
      offerDetails: (() => {
        try {
          return m.offerJson ? JSON.parse(m.offerJson) : void 0;
        } catch {
          return void 0;
        }
      })(),
      read: m.read
    }));
    res.json({ messages: formatted });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});
router3.post("/send", requireAuth, async (req, res) => {
  try {
    const { conversationId, text, offerDetails } = req.body;
    if (!conversationId || !text) {
      res.status(400).json({ error: "Conversation ID and text are required." });
      return;
    }
    const userId = req.user.id;
    const membership = await db_default.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId, userId } }
    });
    if (!membership) {
      res.status(403).json({ error: "Access denied." });
      return;
    }
    const recipientPart = await db_default.conversationUser.findFirst({
      where: { conversationId, userId: { not: userId } }
    });
    const message = await db_default.message.create({
      data: {
        conversationId,
        senderId: userId,
        recipientId: recipientPart?.userId || userId,
        text,
        offerJson: offerDetails ? JSON.stringify(offerDetails) : ""
      }
    });
    await db_default.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: /* @__PURE__ */ new Date() }
    });
    if (recipientPart) {
      await db_default.conversationUser.update({
        where: { conversationId_userId: { conversationId, userId: recipientPart.userId } },
        data: { unreadCount: { increment: 1 } }
      });
      await db_default.notification.create({
        data: {
          userId: recipientPart.userId,
          type: "message",
          title: "New Message",
          message: `${req.user.name}: ${text.substring(0, 100)}`,
          linkTo: conversationId
        }
      });
    }
    if (offerDetails) {
      await db_default.tradeOffer.create({
        data: {
          listingId: offerDetails.cropId || "",
          buyerId: req.user.role === "buyer" ? userId : recipientPart?.userId || "",
          farmerId: req.user.role === "farmer" ? userId : recipientPart?.userId || "",
          proposedPrice: offerDetails.proposedPrice || 0,
          proposedQuantity: offerDetails.proposedQuantity || 0,
          unit: offerDetails.unit || "quintals",
          totalAmount: offerDetails.totalAmount || 0,
          status: "pending",
          notes: offerDetails.notes || ""
        }
      });
    }
    res.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: req.user.name,
        senderRole: req.user.role,
        recipientId: message.recipientId,
        text: message.text,
        timestamp: formatTime(message.createdAt),
        offerDetails,
        read: false
      }
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});
router3.put("/offer-status", requireAuth, async (req, res) => {
  try {
    const { conversationId, messageId, status } = req.body;
    if (!conversationId || !messageId || !["accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid parameters." });
      return;
    }
    const msg = await db_default.message.findUnique({ where: { id: messageId } });
    if (!msg) {
      res.status(404).json({ error: "Message not found." });
      return;
    }
    let offerData = {};
    try {
      offerData = msg.offerJson ? JSON.parse(msg.offerJson) : {};
    } catch {
    }
    offerData.status = status;
    await db_default.message.update({
      where: { id: messageId },
      data: { offerJson: JSON.stringify(offerData) }
    });
    if (msg.senderId !== req.user.id) {
      await db_default.notification.create({
        data: {
          userId: msg.senderId,
          type: "offer",
          title: status === "accepted" ? "Trade Offer Accepted!" : "Trade Offer Declined",
          message: `${req.user.name} has ${status} your trade offer.`,
          linkTo: conversationId
        }
      });
    }
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: "Failed to update offer status." });
  }
});
router3.get("/unread", requireAuth, async (req, res) => {
  try {
    const result = await db_default.conversationUser.aggregate({
      where: { userId: req.user.id },
      _sum: { unreadCount: true }
    });
    res.json({ count: result._sum.unreadCount || 0 });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});
function formatTime(date) {
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
var messages_default = router3;

// src/server/routes/notifications.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await db_default.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    const unreadCount = await db_default.notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});
router4.put("/read", requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await db_default.notification.updateMany({
        where: { id: { in: ids }, userId: req.user.id },
        data: { read: true }
      });
    } else {
      await db_default.notification.updateMany({
        where: { userId: req.user.id, read: false },
        data: { read: true }
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as read." });
  }
});
router4.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const count = await db_default.notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});
router4.delete("/:id", requireAuth, async (req, res) => {
  try {
    await db_default.notification.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification." });
  }
});
var notifications_default = router4;

// src/server/routes/market.ts
var import_express5 = require("express");
var router5 = (0, import_express5.Router)();
router5.get("/prices", async (_req, res) => {
  try {
    let prices = await db_default.marketPrice.findMany({
      orderBy: { fetchedAt: "desc" },
      take: 50
    });
    if (prices.length === 0) {
      const defaults = [
        { crop: "Basmati Rice (1121)", market: "Karnal Mandi", mandiPrice: 3450, directPrice: 3850, change: "+4.2%", trend: "up", unit: "\u20B9/qtl" },
        { crop: "Sharbati Wheat", market: "Khanna APMC", mandiPrice: 2420, directPrice: 2680, change: "+1.8%", trend: "up", unit: "\u20B9/qtl" },
        { crop: "Red Hybrid Tomato", market: "Nashik Mandi", mandiPrice: 1450, directPrice: 1650, change: "-3.1%", trend: "down", unit: "\u20B9/qtl" },
        { crop: "Salem Turmeric", market: "Erode Yard", mandiPrice: 11800, directPrice: 13200, change: "+8.5%", trend: "up", unit: "\u20B9/qtl" },
        { crop: "Garva Red Onion", market: "Lasalgaon Mandi", mandiPrice: 1980, directPrice: 2250, change: "+5.4%", trend: "up", unit: "\u20B9/qtl" },
        { crop: "Teja Red Chili", market: "Guntur APMC", mandiPrice: 17800, directPrice: 19500, change: "+2.1%", trend: "up", unit: "\u20B9/qtl" },
        { crop: "Yellow Soybean", market: "Indore Mandi", mandiPrice: 4600, directPrice: 4950, change: "+0.5%", trend: "stable", unit: "\u20B9/qtl" }
      ];
      prices = defaults.map((d, i) => ({
        id: String(i + 1),
        ...d,
        fetchedAt: /* @__PURE__ */ new Date()
      }));
    }
    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prices." });
  }
});
router5.get("/trade-offers", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const offers = await db_default.tradeOffer.findMany({
      where: {
        OR: [{ buyerId: userId }, { farmerId: userId }]
      },
      include: {
        listing: {
          select: { id: true, title: true, cropName: true, images: { take: 1 } }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ offers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trade offers." });
  }
});
router5.put("/trade-offers/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid status." });
      return;
    }
    const offer = await db_default.tradeOffer.findUnique({ where: { id: req.params.id } });
    if (!offer) {
      res.status(404).json({ error: "Offer not found." });
      return;
    }
    if (offer.farmerId !== req.user.id) {
      res.status(403).json({ error: "Only the farmer can update offer status." });
      return;
    }
    const updated = await db_default.tradeOffer.update({
      where: { id: req.params.id },
      data: { status }
    });
    await db_default.notification.create({
      data: {
        userId: offer.buyerId,
        type: "offer",
        title: status === "accepted" ? "Your Offer Was Accepted!" : "Your Offer Was Declined",
        message: `Your offer of \u20B9${offer.proposedPrice}/${offer.unit} for the listing has been ${status}.`,
        linkTo: offer.listingId
      }
    });
    res.json({ offer: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update offer." });
  }
});
var market_default = router5;

// src/server/routes/upload.ts
var import_express6 = require("express");
var import_multer = __toESM(require("multer"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_uuid = require("uuid");
var router6 = (0, import_express6.Router)();
var uploadDir = import_path.default.join(process.cwd(), "uploads");
var cropDir = import_path.default.join(uploadDir, "crops");
var profileDir = import_path.default.join(uploadDir, "profiles");
[uploadDir, cropDir, profileDir].forEach((dir) => {
  if (!import_fs.default.existsSync(dir)) {
    import_fs.default.mkdirSync(dir, { recursive: true });
  }
});
var storage = import_multer.default.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "crop" || file.fieldname === "images") {
      cb(null, cropDir);
    } else {
      cb(null, profileDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = import_path.default.extname(file.originalname) || ".jpg";
    cb(null, `${(0, import_uuid.v4)()}${ext}`);
  }
});
var fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
  }
};
var upload = (0, import_multer.default)({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB
});
router6.post(
  "/crop",
  requireAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No images uploaded." });
        return;
      }
      const urls = files.map((f) => `/uploads/crops/${f.filename}`);
      res.json({ urls, count: urls.length });
    } catch (err) {
      res.status(500).json({ error: "Upload failed." });
    }
  }
);
router6.post(
  "/profile",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }
      const url = `/uploads/profiles/${req.file.filename}`;
      res.json({ url });
    } catch (err) {
      res.status(500).json({ error: "Upload failed." });
    }
  }
);
var upload_default = router6;

// src/server/routes/weather.ts
var import_express7 = require("express");
var import_genai = require("@google/genai");
var router7 = (0, import_express7.Router)();
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new import_genai.GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}
router7.post("/", async (req, res) => {
  try {
    const { location = "Bardoli, Gujarat, India", crop = "wheat" } = req.body;
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    if (weatherApiKey) {
      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${weatherApiKey}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          const { lat, lon } = geoData[0];
          const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
          const currentRes = await fetch(currentUrl);
          const currentData = await currentRes.json();
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`;
          const forecastRes = await fetch(forecastUrl);
          const forecastData = await forecastRes.json();
          if (currentData.main) {
            const weatherData = buildWeatherFromAPI(currentData, forecastData, location, crop);
            return res.json({ data: weatherData, source: "openweathermap" });
          }
        }
      } catch (apiErr) {
        console.error("OpenWeatherMap API error, falling back to AI:", apiErr);
      }
    }
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are an agricultural meteorologist and farming weather advisor.
Generate current weather and a 7-day forecast for the location: ${location}
Crop context: ${crop}

Return valid JSON with these exact keys:
{
  "current": {
    "temperature": number (Celsius),
    "feelsLike": number,
    "humidity": number (percentage),
    "windSpeed": number (km/h),
    "windDirection": "string",
    "condition": "Sunny / Partly Cloudy / Cloudy / Light Rain / Heavy Rain / Thunderstorm / Foggy",
    "uvIndex": number (0-11),
    "visibility": number (km),
    "pressure": number (hPa)
  },
  "forecast": [
    {
      "day": "Monday",
      "date": "2026-08-20",
      "high": number,
      "low": number,
      "condition": "string",
      "rainChance": number (0-100),
      "rainfall": number (mm)
    }
  ],
  "alerts": [
    {
      "type": "rain|heat|storm|frost|humidity|wind",
      "severity": "low|medium|high|critical",
      "title": "Alert title",
      "message": "Brief description",
      "action": "Recommended action for farmers"
    }
  ],
  "farmingAdvisory": {
    "irrigation": "Irrigation recommendation based on weather",
    "pestRisk": "Pest risk assessment based on weather",
    "harvestAdvice": "Harvest timing advice",
    "generalTip": "General farming tip for current conditions"
  },
  "location": "${location}",
  "lastUpdated": "ISO timestamp"
}

Use realistic weather data for the Indian subcontinent in August (monsoon season). Generate 7 days of forecast.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.5 }
      });
      try {
        const parsed = JSON.parse(response.text || "{}");
        return res.json({ data: { ...parsed, location, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() }, source: "gemini-3.7-flash" });
      } catch {
      }
    }
    const fallbackWeather = buildFallbackWeather(location, crop);
    return res.json({ data: fallbackWeather, source: "agriconnect-expert-engine" });
  } catch (error) {
    console.error("Weather error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch weather data" });
  }
});
function buildWeatherFromAPI(current, forecast, location, crop) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const conditionMap = {
    "Clear": "Sunny",
    "Clouds": "Partly Cloudy",
    "Rain": "Light Rain",
    "Drizzle": "Light Rain",
    "Thunderstorm": "Thunderstorm",
    "Snow": "Heavy Rain",
    "Mist": "Foggy",
    "Fog": "Foggy",
    "Haze": "Partly Cloudy"
  };
  const currentCondition = conditionMap[current.weather?.[0]?.main] || "Partly Cloudy";
  const forecastDays = [];
  const seenDates = /* @__PURE__ */ new Set();
  if (forecast.list) {
    for (const item of forecast.list) {
      const date = new Date(item.dt * 1e3);
      const dateStr = date.toISOString().split("T")[0];
      if (seenDates.has(dateStr) || forecastDays.length >= 7) continue;
      seenDates.add(dateStr);
      forecastDays.push({
        day: days[date.getDay()],
        date: dateStr,
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        condition: conditionMap[item.weather?.[0]?.main] || "Partly Cloudy",
        rainChance: Math.round((item.pop || 0) * 100),
        rainfall: Math.round(item.rain?.["3h"] || 0)
      });
    }
  }
  const humidity = current.main?.humidity || 70;
  const temp = Math.round(current.main?.temp || 30);
  const alerts = [];
  if (temp > 38) {
    alerts.push({ type: "heat", severity: "high", title: "Heat Wave Warning", message: `Temperature at ${temp}\xB0C \u2014 extreme heat may damage crops.`, action: "Provide shade nets and increase irrigation frequency." });
  }
  if (humidity > 85) {
    alerts.push({ type: "humidity", severity: "medium", title: "High Humidity \u2014 Fungal Risk", message: `Humidity at ${humidity}% creates conditions for fungal diseases.`, action: "Apply preventive fungicide spray. Improve air circulation." });
  }
  const rainyDay = forecastDays.find((d) => d.rainChance > 70 && d.rainfall > 10);
  if (rainyDay) {
    alerts.push({ type: "rain", severity: "medium", title: "Heavy Rain Expected", message: `${rainyDay.rainChance}% chance of ${rainyDay.rainfall}mm on ${rainyDay.day}.`, action: "Clear drainage channels. Cover harvested produce. Avoid spraying." });
  }
  return {
    current: {
      temperature: temp,
      feelsLike: Math.round(current.main?.feels_like || temp + 3),
      humidity,
      windSpeed: Math.round((current.wind?.speed || 0) * 3.6),
      windDirection: getWindDirection(current.wind?.deg || 0),
      condition: currentCondition,
      uvIndex: 6,
      visibility: Math.round((current.visibility || 8e3) / 1e3),
      pressure: current.main?.pressure || 1013
    },
    forecast: forecastDays.length > 0 ? forecastDays : buildFallbackForecast(),
    alerts,
    farmingAdvisory: {
      irrigation: `With current conditions at ${temp}\xB0C and ${humidity}% humidity, monitor soil moisture at 15cm depth. ${humidity > 70 ? "Reduce irrigation frequency as rainfall\u8865\u5145 moisture." : "Increase drip irrigation to maintain field capacity."}`,
      pestRisk: humidity > 80 ? "High humidity increases risk of fungal diseases. Install 8-10 pheromone traps per acre." : "Moderate pest risk. Monitor leaf undersides every 2-3 days.",
      harvestAdvice: `If ${crop} is approaching maturity, plan harvesting within a dry window. Ensure grain moisture is below 14% before storage.`,
      generalTip: `Maintain balanced nitrogen nutrition for ${crop}. Keep drainage channels clear to prevent waterlogging during monsoon.`
    },
    location,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function getWindDirection(degrees) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(degrees / 22.5) % 16];
}
function buildFallbackForecast() {
  const today = /* @__PURE__ */ new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const rainChance = i < 3 ? [80, 60, 70][i] : [40, 30, 50, 25][i - 3] || 30;
    const isRainy = rainChance > 50;
    forecast.push({
      day: days[d.getDay()],
      date: d.toISOString().split("T")[0],
      high: isRainy ? 30 + Math.floor(Math.random() * 3) : 33 + Math.floor(Math.random() * 4),
      low: 23 + Math.floor(Math.random() * 3),
      condition: isRainy ? rainChance > 70 ? "Heavy Rain" : "Light Rain" : "Partly Cloudy",
      rainChance,
      rainfall: isRainy ? 15 + Math.floor(Math.random() * 25) : Math.floor(Math.random() * 5)
    });
  }
  return forecast;
}
function buildFallbackWeather(location, crop) {
  return {
    current: {
      temperature: 31,
      feelsLike: 36,
      humidity: 82,
      windSpeed: 14,
      windDirection: "SW",
      condition: "Partly Cloudy",
      uvIndex: 6,
      visibility: 8,
      pressure: 1008
    },
    forecast: buildFallbackForecast(),
    alerts: [
      { type: "rain", severity: "medium", title: "Monsoon Rain Expected", message: `Moderate to heavy rainfall expected in ${location} over the next 2-3 days.`, action: "Clear field drainage channels, cover harvested produce, avoid pesticide sprays 24h before rain." },
      { type: "humidity", severity: "medium", title: "High Humidity \u2014 Fungal Risk", message: "Humidity above 80% creates conditions for blight, mildew, and rust.", action: "Apply preventive Mancozeb 75% WP (2.5 g/L) or Copper Oxychloride (3 g/L) spray." }
    ],
    farmingAdvisory: {
      irrigation: `With monsoon rains active, avoid irrigation for rain-fed fields. For drip-irrigated ${crop} plots, reduce frequency to once every 3-4 days.`,
      pestRisk: `High humidity increases risk of stem borer, leaf folder, and sheath blight in ${crop}. Install 8-10 pheromone traps per acre.`,
      harvestAdvice: `If ${crop} is approaching maturity, plan harvesting within a dry window. Avoid harvesting during or after rain.`,
      generalTip: `Use this period to apply nitrogen top-dressing washed in by rain. Keep drainage channels clear.`
    },
    location,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var weather_default = router7;

// src/server/routes/ai.ts
var import_express8 = require("express");
var import_genai2 = require("@google/genai");
var router8 = (0, import_express8.Router)();
function getGeminiClient2() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  return new import_genai2.GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}
router8.post("/advisor", async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const ai = getGeminiClient2();
    if (ai) {
      const systemInstruction = `You are "AgriConnect AI Advisor" (Kisan Mitra), an expert agricultural scientist, agronomist, and farm market consultant.
You provide clear, highly practical, actionable advice to Indian and global farmers and agricultural buyers.
Your domain expertise includes:
- Crop disease identification, pest management, bio-pesticides, and chemical treatments with dosage.
- Soil nutrition, NPK balance, compost, organic farming, biofertilizers.
- Weather adaptation, climate resilience, irrigation scheduling (drip/sprinkler).
- Government schemes (PM-KISAN, e-NAM, Soil Health Card, Crop Insurance / PMFBY, MSP guidelines).
- Harvest timing, post-harvest storage, grain quality grading, direct-to-buyer negotiation tips.
- Market price trends and mandi price optimization.
Format your responses with clear headings, bullet points, and highlight critical warnings.
Keep language friendly, empathetic, respectful, and easy to understand.`;
      const conversationContents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          conversationContents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text || item.content || "" }]
          });
        }
      }
      conversationContents.push({
        role: "user",
        parts: [{ text: `${context?.cropContext ? `[Context: User is working with ${context.cropContext} in ${context.region || "India"}] ` : ""}${message}` }]
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: conversationContents,
        config: { systemInstruction, temperature: 0.7 }
      });
      res.json({
        reply: response.text || "Please maintain proper soil aeration and check moisture levels.",
        source: "gemini-3.7-flash"
      });
      return;
    }
    const lower = message.toLowerCase();
    let fallbackReply = "";
    if (lower.includes("pest") || lower.includes("insect") || lower.includes("leaf") || lower.includes("disease") || lower.includes("rot")) {
      fallbackReply = `### \u{1F33F} Pest & Disease Management Advisory

**1. Immediate Diagnosis:**
- Inspect underside of leaves for aphids, whiteflies, or fungal spores.
- Check soil moisture around root zones.

**2. Organic Measures:**
- **Neem Oil Spray:** Mix 5ml Neem oil + 2ml liquid soap per liter. Spray early morning.
- **Trichoderma viride:** Apply 2.5 kg/acre with FYM for soil-borne pathogens.

**3. Chemical Control (If Severe):**
- Sucking pests: Imidacloprid 17.8% SL @ 0.5 ml/liter.
- Fungal: Mancozeb 75% WP @ 2.5 g/liter.

\u26A0\uFE0F *Safety:* Observe 7-10 day waiting period before harvest.`;
    } else if (lower.includes("price") || lower.includes("mandi") || lower.includes("market") || lower.includes("sell")) {
      fallbackReply = `### \u{1F4C8} Market Intelligence & Price Strategy

**Current Market Outlook:**
- Grade-A produce attracts **12\u201318% premium** over APMC mandi rates via direct sale.

**Negotiation Tips:**
- Offer moisture testing reports (<12% for grains).
- Bundle transport for wholesale buyers.
- Lock MOQ with 20% advance token.`;
    } else if (lower.includes("fertilizer") || lower.includes("npk") || lower.includes("soil") || lower.includes("urea")) {
      fallbackReply = `### \u{1F9EA} Fertilizer & Soil Health Schedule

**Basal (At Sowing):** SSP + 50% Potash + 25% Nitrogen + 5 tons FYM/acre.

**Vegetative (25-35 Days):** Urea top-dress + Zinc Sulfate 10kg/acre + Foliar 19:19:19 @ 5g/L.

**Flowering:** Spray 0:52:34 @ 5g/L for grain weight and disease resistance.`;
    } else {
      fallbackReply = `### \u{1F331} Smart Farming Advice

1. **Soil & Irrigation:** Ensure well-drained beds with adequate organic carbon. Adopt drip irrigation.
2. **Crop Monitoring:** Check germination within 5\u20137 days. Use yellow sticky traps (10/acre).
3. **Market Connect:** List harvest 14 days early on AgriConnect for forward contracts.

*Specify your crop name for tailored recommendations!*`;
    }
    res.json({ reply: fallbackReply, source: "agriconnect-expert-engine" });
  } catch (error) {
    console.error("Advisor error:", error);
    res.status(500).json({ error: error.message || "Failed to generate advice" });
  }
});
router8.post("/plan", async (req, res) => {
  try {
    const { crop, landSize, unit = "acres", soilType, irrigation, season, budget, location, targetYield } = req.body;
    if (!crop || !landSize) {
      res.status(400).json({ error: "Crop name and land size are required" });
      return;
    }
    const ai = getGeminiClient2();
    if (ai) {
      const prompt = `You are a precision agriculture and agritrade planning specialist.
Generate a comprehensive "AgriConnect Farm & Trading Blueprint" for:
- Crop: ${crop}, Land Area: ${landSize} ${unit}, Soil: ${soilType || "Alluvial"}, Irrigation: ${irrigation || "Drip"}, Season: ${season || "Rabi/Kharif"}, Budget: ${budget ? `\u20B9${budget}` : "Standard"}, Region: ${location || "Indo-Gangetic Plains"}
${targetYield ? `- Target Yield: ${targetYield}` : ""}
Provide sections: Executive Summary, Week-by-Week Roadmap, Nutrition Matrix, Pest Mitigation, Cost Breakdown, Trading Strategy. Use realistic \u20B9 figures.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { temperature: 0.6 }
      });
      res.json({ plan: response.text, source: "gemini-3.7-flash" });
      return;
    }
    const sizeNum = parseFloat(landSize) || 1;
    const estYield = crop.toLowerCase().includes("wheat") ? 18 : crop.toLowerCase().includes("rice") ? 22 : crop.toLowerCase().includes("tomato") ? 150 : 25;
    const totalYield = Math.round(estYield * sizeNum);
    const estRate = crop.toLowerCase().includes("wheat") ? 2450 : crop.toLowerCase().includes("rice") ? 2800 : 1800;
    const estRevenue = totalYield * estRate;
    const totalCost = Math.round(22e3 * sizeNum);
    res.json({
      plan: `# \u{1F33E} Farm & Trading Blueprint: ${crop.toUpperCase()} (${landSize} ${unit})

## 1. Executive Summary
- Yield: **${totalYield} Quintals** | Cost: **\u20B9${totalCost.toLocaleString()}** | Revenue: **\u20B9${estRevenue.toLocaleString()}** | Profit: **\u20B9${(estRevenue - totalCost).toLocaleString()}** (${Math.round((estRevenue - totalCost) / totalCost * 100)}% ROI)

## 2. Week-by-Week Roadmap
- Week 1-2: Land prep + basal feeding (FYM 4-5t/acre + SSP 100kg/acre)
- Week 3-4: Sowing + first irrigation
- Week 5-8: Vegetative growth + first Urea top-dress (35kg/acre)
- Week 9-13: Flowering + irrigation management
- Week 14-16: Harvest at 14-16% moisture

## 3. Cost Breakdown
- Machinery: \u20B9${Math.round(totalCost * 0.18).toLocaleString()} | Seeds: \u20B9${Math.round(totalCost * 0.14).toLocaleString()} | Fertilizers: \u20B9${Math.round(totalCost * 0.28).toLocaleString()} | Labor: \u20B9${Math.round(totalCost * 0.22).toLocaleString()} | Logistics: \u20B9${Math.round(totalCost * 0.18).toLocaleString()}`,
      source: "agriconnect-expert-engine"
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate plan" });
  }
});
router8.post("/price-estimate", async (req, res) => {
  try {
    const { crop, variety, grade = "Grade A", location } = req.body;
    const ai = getGeminiClient2();
    if (ai && crop) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Estimate prices for: Crop: ${crop}, Variety: ${variety || "Standard"}, Grade: ${grade}, Region: ${location || "India"}. Return JSON: { minMandiPrice, maxMandiPrice, avgMandiPrice, recommendedDirectPrice, marketTrend, trendPercentage, mspRate, analysis, tradingTip }`,
          config: { responseMimeType: "application/json", temperature: 0.4 }
        });
        const parsed = JSON.parse(response.text || "{}");
        res.json({ data: parsed, source: "gemini-3.7-flash" });
        return;
      } catch {
      }
    }
    const cropLower = (crop || "").toLowerCase();
    let base = 2500, msp = 2275;
    if (cropLower.includes("wheat")) {
      base = 2450;
      msp = 2275;
    } else if (cropLower.includes("rice")) {
      base = 2900;
      msp = 2300;
    } else if (cropLower.includes("tomato")) {
      base = 1800;
      msp = 1400;
    } else if (cropLower.includes("cotton")) {
      base = 7100;
      msp = 6620;
    } else if (cropLower.includes("soybean")) {
      base = 4800;
      msp = 4600;
    } else if (cropLower.includes("onion")) {
      base = 2100;
      msp = 1500;
    } else if (cropLower.includes("turmeric")) {
      base = 12500;
      msp = 9500;
    }
    res.json({
      data: {
        minMandiPrice: Math.round(base * 0.92),
        maxMandiPrice: Math.round(base * 1.08),
        avgMandiPrice: base,
        recommendedDirectPrice: Math.round(base * 1.12),
        marketTrend: "bullish",
        trendPercentage: "+6.4%",
        mspRate: msp,
        analysis: `Demand for clean ${grade} ${crop || "produce"} remains firm.`,
        tradingTip: `Direct sale on AgriConnect fetches ~12% above local APMC prices.`
      },
      source: "agriconnect-expert-engine"
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to estimate price" });
  }
});
router8.post("/analyze-crop", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: "Image is required" });
      return;
    }
    const ai = getGeminiClient2();
    if (ai) {
      try {
        const prompt = `Analyze this crop/plant image. Return JSON: { cropName, cropCondition (Good/Fair/Poor/Critical), quality (Excellent/Good/Average/Below Average), growthStage, possibleDiseases[], diseaseDetails, fertilizers[{name,dosage,timing,purpose}], harvestDaysEstimate, precautions[], overallScore (0-100), explanation }`;
        const mimeType = image.startsWith("data:image/png") ? "image/png" : image.startsWith("data:image/webp") ? "image/webp" : "image/jpeg";
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ inlineData: { mimeType, data: image.split(",")[1] } }, { text: prompt }] }],
          config: { responseMimeType: "application/json", temperature: 0.4 }
        });
        const parsed = JSON.parse(response.text || "{}");
        res.json({ data: parsed, source: "gemini-3.7-flash" });
        return;
      } catch {
      }
    }
    res.json({
      data: {
        cropName: "Wheat (Triticum aestivum)",
        cropCondition: "Good",
        quality: "Good",
        growthStage: "Vegetative",
        possibleDiseases: ["No critical diseases detected"],
        diseaseDetails: "Crop appears healthy. Monitor for early blight during humid weather.",
        fertilizers: [
          { name: "Urea (46-0-0)", dosage: "40 kg/acre", timing: "Vegetative stage", purpose: "Leaf and stem growth" },
          { name: "DAP (18-46-0)", dosage: "50 kg/acre", timing: "At sowing", purpose: "Root development" },
          { name: "Zinc Sulphate", dosage: "10 kg/acre", timing: "25-30 days after sowing", purpose: "Chlorophyll formation" }
        ],
        harvestDaysEstimate: "45-60 days",
        precautions: ["Monitor for rust during humid weather", "Avoid waterlogging", "Apply neem pesticide for aphids", "No sprays within 15 days of harvest"],
        overallScore: 72,
        explanation: "Good vegetative growth. Follow fertilization schedule for optimal yield."
      },
      source: "agriconnect-expert-engine"
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to analyze crop" });
  }
});
var ai_default = router8;

// server.ts
import_dotenv.default.config();
var app = (0, import_express9.default)();
var PORT = process.env.PORT || 3e3;
app.use(import_express9.default.json({ limit: "10mb" }));
app.use("/uploads", import_express9.default.static(import_path2.default.join(process.cwd(), "uploads")));
app.use("/api/auth", auth_default);
app.use("/api/listings", listings_default);
app.use("/api/messages", messages_default);
app.use("/api/notifications", notifications_default);
app.use("/api/market", market_default);
app.use("/api/upload", upload_default);
app.use("/api/weather", weather_default);
app.use("/api/ai", ai_default);
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
    weatherApiEnabled: Boolean(process.env.OPENWEATHER_API_KEY),
    version: "1.0.0"
  });
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express9.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F33E} AgriConnect Server running on http://localhost:${PORT}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
