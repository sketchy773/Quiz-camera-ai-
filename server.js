import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// serve public files and uploads
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-capture-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// keep track of last uploaded filename (in-memory)
let lastUploaded = null;

app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  lastUploaded = req.file.filename;
  const publicPath = `/uploads/${req.file.filename}`;

  // Log absolute URL so Render logs show clickable link
  const absoluteUrl = `${process.env.BASE_URL ? process.env.BASE_URL : `https://${process.env.RENDER_EXTERNAL_URL || req.hostname}`}${publicPath}`;
  // If Render provides RENDER_EXTERNAL_URL env var (when using custom domain), we use it; otherwise fallback to req.hostname.
  console.log(`📸 Photo uploaded: ${req.file.filename}`);
  console.log(`🔗 Open: ${absoluteUrl}`);

  return res.json({ success: true, filePath: publicPath, absoluteUrl });
});

// handy endpoint to get last uploaded image absolute URL
app.get("/last", (req, res) => {
  if (!lastUploaded) return res.status(404).send("No uploads yet");
  const publicPath = `/uploads/${lastUploaded}`;
  const absoluteUrl = `${process.env.BASE_URL ? process.env.BASE_URL : `https://${process.env.RENDER_EXTERNAL_URL || req.hostname}`}${publicPath}`;
  return res.json({ filePath: publicPath, absoluteUrl });
});

// optional: list all uploads (small helper)
app.get("/list-uploads", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir).sort().reverse();
    const urls = files.map(f => `${process.env.BASE_URL ? process.env.BASE_URL : `https://${process.env.RENDER_EXTERNAL_URL || req.hostname}`}/uploads/${f}`);
    return res.json({ count: files.length, files, urls });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.send("ok"));

app.listen(port, () => console.log(`✅ Server running on port ${port}`));