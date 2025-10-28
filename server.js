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

// Serve static files
app.use(express.static("public"));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `capture_${Date.now()}.jpg`)
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false });
  console.log("✅ Uploaded:", req.file.filename);
  res.json({
    success: true,
    message: "Photo uploaded!",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`✅ Live on port ${PORT}`));