import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

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

// ✅ Serve static frontend (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Serve uploaded images publicly
app.use("/uploads", express.static(uploadDir));

// ✅ Upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileURL = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("📸 Photo Uploaded:", fileURL); // <-- Ye logs me dikhega

  res.json({
    message: "Photo uploaded successfully",
    fileURL
  });
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));