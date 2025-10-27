import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 10000;

// Ensure 'uploads' folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Serve static files from public folder
app.use(express.static("public"));

// Upload endpoint
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `https://${req.hostname}/uploads/${req.file.filename}`;
  console.log("📸 Uploaded File URL:", fileUrl);

  res.json({ message: "Photo uploaded successfully!", url: fileUrl });
});

// Serve uploaded images publicly
app.use("/uploads", express.static("uploads"));

// Default route
app.get("/", (req, res) => {
  res.send("✅ Quiz Camera AI Server is running!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));