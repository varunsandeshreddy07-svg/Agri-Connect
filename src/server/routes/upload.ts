import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, AuthRequest } from "../auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), "uploads");
const cropDir = path.join(uploadDir, "crops");
const profileDir = path.join(uploadDir, "profiles");

[uploadDir, cropDir, profileDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "crop" || file.fieldname === "images") {
      cb(null, cropDir);
    } else {
      cb(null, profileDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/upload/crop — upload crop images (1-5 images)
router.post(
  "/crop",
  requireAuth,
  upload.array("images", 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No images uploaded." });
        return;
      }

      const urls = files.map((f) => `/uploads/crops/${f.filename}`);
      res.json({ urls, count: urls.length });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed." });
    }
  }
);

// POST /api/upload/profile — upload profile avatar
router.post(
  "/profile",
  requireAuth,
  upload.single("avatar"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded." });
        return;
      }

      const url = `/uploads/profiles/${req.file.filename}`;
      res.json({ url });
    } catch (err: any) {
      res.status(500).json({ error: "Upload failed." });
    }
  }
);

export default router;
