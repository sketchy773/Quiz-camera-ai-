import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 10000;

// Telegram credentials from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware setup
app.use(express.static("public"));

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "photo_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to handle image upload
app.post("/upload", upload.single("photo"), async (req, res) => {
  const filePath = req.file.path;
  console.log(`📸 New image uploaded: ${filePath}`);

  try {
    // Send photo to Telegram
    const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("caption", `📸 New photo uploaded: ${req.file.filename}`);
    formData.append("photo", fs.createReadStream(filePath));

    const response = await fetch(telegramURL, { method: "POST", body: formData });
    const result = await response.json();

    console.log("✅ Telegram response:", result);
  } catch (error) {
    console.error("❌ Error sending photo to Telegram:", error);
  }

  res.json({ success: true, message: "Photo uploaded successfully!" });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});