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

// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `photo_${Date.now()}.png`)
});
const upload = multer({ storage });

// ✅ Serve frontend & uploads
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadDir));

// ✅ Upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log(`📸 Photo uploaded: ${photoUrl}`); // ✅ Render logs me dikhega

  res.json({ message: "Photo uploaded successfully", fileUrl: photoUrl });
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));