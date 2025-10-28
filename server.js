import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quiz-camera-ai",
    allowed_formats: ["jpg", "png"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

// Capture route
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  console.log("📸 Photo uploaded:", req.file.path);
  res.json({
    message: "Photo uploaded successfully!",
    url: req.file.path, // Permanent Cloudinary URL
  });
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));