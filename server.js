import express from "express";
import multer from "multer";
import path from "path";
import TelegramBot from "node-telegram-bot-api";

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram setup
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(botToken);

// Serve frontend
app.use(express.static("public"));

// Setup uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Handle uploads
app.post("/upload", upload.single("photo"), (req, res) => {
  const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("📸 Image captured:", filePath);

  // Send message to Telegram
  bot.sendMessage(chatId, `📸 New image uploaded:\n${filePath}`);

  res.json({ success: true });
});

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));