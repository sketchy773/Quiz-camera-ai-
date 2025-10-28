import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

// ensure uploads directory exists (important on Render)
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
  console.log("✅ Created uploads folder");
}

// serve frontend static
app.use(express.static(path.join(process.cwd(), "public")));

// serve uploads publicly
app.use("/uploads", express.static(UPLOAD_DIR));

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // unique filename
    cb(null, `capture_${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

// upload endpoint
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // build absolute URL so Render logs show clickable link
  const host = req.get("host"); // includes port if present
  const proto = req.protocol;
  const absoluteUrl = `${proto}://${host}/uploads/${req.file.filename}`;

  // log clickable URL in Render logs
  console.log(`📸 Photo uploaded: ${req.file.filename}`);
  console.log(`🔗 Open: ${absoluteUrl}`);

  return res.json({ success: true, filePath: `/uploads/${req.file.filename}`, absoluteUrl });
});

// fallback to index
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// start
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));