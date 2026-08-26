import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../auth.js";
import prisma from "../db.js";

const router = Router();

// GET /api/messages/conversations — list user's conversations
router.get("/conversations", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const participations = await prisma.conversationUser.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            users: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true, role: true, verificationLevel: true, phone: true, location: true },
                },
              },
            },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
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
        messages: [], // Messages loaded separately
      };
    });

    res.json({ conversations });
  } catch (err: any) {
    console.error("Conversations fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
});

// POST /api/messages/conversations — start or find a conversation
router.post("/conversations", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      res.status(400).json({ error: "Recipient ID is required." });
      return;
    }

    const userId = req.user!.id;

    // Check if conversation already exists between these two users
    const existingParticipation = await prisma.conversationUser.findFirst({
      where: {
        userId,
        conversation: {
          users: { some: { userId: recipientId } },
        },
      },
      include: { conversation: true },
    });

    if (existingParticipation) {
      res.json({ conversationId: existingParticipation.conversationId });
      return;
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        users: {
          create: [
            { userId, unreadCount: 0 },
            { userId: recipientId, unreadCount: 0 },
          ],
        },
      },
    });

    res.json({ conversationId: conversation.id });
  } catch (err: any) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation." });
  }
});

// GET /api/messages/conversations/:id — get messages for a conversation
router.get("/conversations/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;

    // Verify user is part of this conversation
    const membership = await prisma.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId: convId, userId } },
    });
    if (!membership) {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    // Mark messages as read
    await prisma.conversationUser.update({
      where: { conversationId_userId: { conversationId: convId, userId } },
      data: { unreadCount: 0 },
    });

    await prisma.message.updateMany({
      where: { conversationId: convId, recipientId: userId, read: false },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderName: m.sender.name,
      senderRole: m.sender.role,
      recipientId: m.recipientId,
      text: m.text,
      timestamp: formatTime(m.createdAt),
      offerDetails: (() => { try { return m.offerJson ? JSON.parse(m.offerJson) : undefined; } catch { return undefined; } })(),
      read: m.read,
    }));

    res.json({ messages: formatted });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// POST /api/messages/send — send a message
router.post("/send", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, text, offerDetails } = req.body;
    if (!conversationId || !text) {
      res.status(400).json({ error: "Conversation ID and text are required." });
      return;
    }

    const userId = req.user!.id;

    // Verify membership
    const membership = await prisma.conversationUser.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!membership) {
      res.status(403).json({ error: "Access denied." });
      return;
    }

    // Find recipient
    const recipientPart = await prisma.conversationUser.findFirst({
      where: { conversationId, userId: { not: userId } },
    });

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        recipientId: recipientPart?.userId || userId,
        text,
        offerJson: offerDetails ? JSON.stringify(offerDetails) : "",
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Increment unread for recipient
    if (recipientPart) {
      await prisma.conversationUser.update({
        where: { conversationId_userId: { conversationId, userId: recipientPart.userId } },
        data: { unreadCount: { increment: 1 } },
      });

      // Create notification for recipient
      await prisma.notification.create({
        data: {
          userId: recipientPart.userId,
          type: "message",
          title: "New Message",
          message: `${req.user!.name}: ${text.substring(0, 100)}`,
          linkTo: conversationId,
        },
      });
    }

    // If it's a trade offer, also create a TradeOffer record
    if (offerDetails) {
      await prisma.tradeOffer.create({
        data: {
          listingId: offerDetails.cropId || "",
          buyerId: req.user!.role === "buyer" ? userId : recipientPart?.userId || "",
          farmerId: req.user!.role === "farmer" ? userId : recipientPart?.userId || "",
          proposedPrice: offerDetails.proposedPrice || 0,
          proposedQuantity: offerDetails.proposedQuantity || 0,
          unit: offerDetails.unit || "quintals",
          totalAmount: offerDetails.totalAmount || 0,
          status: "pending",
          notes: offerDetails.notes || "",
        },
      });
    }

    res.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: req.user!.name,
        senderRole: req.user!.role,
        recipientId: message.recipientId,
        text: message.text,
        timestamp: formatTime(message.createdAt),
        offerDetails,
        read: false,
      },
    });
  } catch (err: any) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// PUT /api/messages/offer-status — update trade offer status
router.put("/offer-status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, messageId, status } = req.body;
    if (!conversationId || !messageId || !["accepted", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid parameters." });
      return;
    }

    // Update the message's offer JSON
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    let offerData: any = {};
    try { offerData = msg.offerJson ? JSON.parse(msg.offerJson) : {}; } catch {}
    offerData.status = status;

    await prisma.message.update({
      where: { id: messageId },
      data: { offerJson: JSON.stringify(offerData) },
    });

    // Notify the original sender
    if (msg.senderId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: msg.senderId,
          type: "offer",
          title: status === "accepted" ? "Trade Offer Accepted!" : "Trade Offer Declined",
          message: `${req.user!.name} has ${status} your trade offer.`,
          linkTo: conversationId,
        },
      });
    }

    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update offer status." });
  }
});

// GET /api/messages/unread — get total unread count
router.get("/unread", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.conversationUser.aggregate({
      where: { userId: req.user!.id },
      _sum: { unreadCount: true },
    });
    res.json({ count: result._sum.unreadCount || 0 });
  } catch (err: any) {
    res.status(500).json({ count: 0 });
  }
});

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default router;
