import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

// ensure uploads folder exists (in repo create uploads/.gitkeep and commit)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("uploads/ folder created");
}

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "public")));

// serve uploads as public
app.use("/uploads", express.static(uploadDir));

// upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded" });
  }

  // build public file url (works on Render)
  const host = req.get("host");
  const protocol = req.protocol;
  const publicUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  // log url so Render logs show it
  console.log(`📸 Photo uploaded: ${publicUrl}`);

  // respond with full URL
  res.json({
    success: true,
    filePath: publicUrl,
    filename: req.file.filename
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});