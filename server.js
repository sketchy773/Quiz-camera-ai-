import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

// Ensure uploads folder exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files (frontend)
app.use(express.static("public"));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `capture_${Date.now()}.jpg`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  console.log("📸 Photo uploaded:", req.file.filename);
  res.json({
    success: true,
    message: "Photo uploaded successfully!",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});