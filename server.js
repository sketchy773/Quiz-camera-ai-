import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  const photoURL = `/uploads/${req.file.filename}`;
  console.log(`📸 Photo uploaded: http://quiz-camera-ai-1.onrender.com${photoURL}`);
  res.json({ success: true, url: photoURL });
});

// Start server
app.listen(port, () => console.log(`✅ Server running on port ${port}`));