// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve static files: index.html (root) and uploads folder
app.use(express.static(path.join(__dirname, "public"))); // if you keep index.html in public/
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer config to save uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp + original name
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});
const upload = multer({ storage });

// Upload endpoint (called by frontend)
app.post("/upload", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const filename = req.file.filename;
    const fileUrl = `/uploads/${encodeURIComponent(filename)}`;

    console.log("📸 Photo received:", filename);
    // Return filename and direct URL to access
    res.json({ success: true, filename, url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

// JSON API: list all photos
app.get("/api/photos", (req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return res.json({ files: [] });
    const files = fs.readdirSync(UPLOAD_DIR)
      .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
      .map(f => ({ name: f, url: `/uploads/${encodeURIComponent(f)}` }))
      .sort((a,b) => b.name.localeCompare(a.name)); // newest first
    res.json({ files });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to read uploads" });
  }
});

// Simple browser gallery page to view & download uploaded photos
app.get("/photos", (req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return res.send("<p>No photos yet.</p>");
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
    let html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Uploaded Photos</title>
  <style>
    body{font-family:system-ui,Arial,Helvetica;padding:12px}
    h1{font-size:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
    .card{border:1px solid #eee;border-radius:8px;padding:8px;text-align:center;background:#fff}
    img{width:120px;height:90px;object-fit:cover;border-radius:6px}
    a.dl{display:inline-block;margin-top:6px;font-size:13px;color:#0a84ff;text-decoration:none}
  </style>
</head>
<body>
  <h1>Uploaded Photos</h1>
  <p>Tap any image to open. Use Download to save to your phone.</p>
  <div class="grid">`;

    // show newest first
    files.sort((a,b) => b.localeCompare(a));
    for (const f of files) {
      const url = `/uploads/${encodeURIComponent(f)}`;
      html += `<div class="card"><a href="${url}" target="_blank"><img src="${url}" alt="${f}"></a><div><a class="dl" href="${url}" download>Download</a></div></div>`;
    }

    html += `</div></body></html>`;
    res.send(html);
  } catch (err) {
    console.error("Photos page error:", err);
    res.status(500).send("Error reading photos");
  }
});

// If you keep index.html in project root (not in public/), you can also serve it:
// app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Start server (Render sets PORT via env)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📂 Upload dir: ${UPLOAD_DIR}`);
});