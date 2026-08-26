import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../auth.js";
import prisma from "../db.js";

const router = Router();

// GET /api/notifications — get user notifications
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, read: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// PUT /api/notifications/read — mark notifications as read
router.put("/read", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body; // array of notification IDs, or empty to mark all
    if (ids && Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: req.user!.id },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id, read: false },
        data: { read: true },
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to mark notifications as read." });
  }
});

// GET /api/notifications/unread-count
router.get("/unread-count", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.id, read: false },
    });
    res.json({ count });
  } catch (err: any) {
    res.status(500).json({ count: 0 });
  }
});

// DELETE /api/notifications/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete notification." });
  }
});

export default router;
