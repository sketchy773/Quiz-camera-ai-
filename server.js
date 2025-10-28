import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const app = express();
const PORT = process.env.PORT || 10000;

// Cloudinary config (from Render env variables)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Temp upload folder (Render requirement)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

// Multer setup (for temporary storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `capture_${Date.now()}.jpg`),
});
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  try {
    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "quiz-camera-ai",
      use_filename: true,
    });

    // Delete local temp file to save space
    fs.unlinkSync(req.file.path);

    console.log(`📸 Photo uploaded to Cloudinary`);
    console.log(`🔗 Open: ${uploadResult.secure_url}`);

    return res.json({
      success: true,
      absoluteUrl: uploadResult.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Fallback route
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));