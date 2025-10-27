import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ES module ke liye __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder ka path
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Agar uploads folder nahi hai to bana lo
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve index.html
app.use("/uploads", express.static(UPLOAD_DIR)); // Serve uploaded images

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + ".jpg");
  },
});

const upload = multer({ storage });

// Upload route
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("📸 Photo received:", req.file.filename);
  res.json({ success: true, filename: req.file.filename });
});

// Route to view uploaded photos
app.get("/photos", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading upload folder");
    }

    // Simple HTML list of uploaded photos
    const html = `
      <html>
        <head><title>Uploaded Photos</title></head>
        <body style="font-family: sans-serif; background: #f5f5f5; padding: 20px;">
          <h2>📷 Uploaded Photos</h2>
          ${
            files.length === 0
              ? "<p>No photos uploaded yet.</p>"
              : files
                  .map(
                    (file) =>
                      `<div style="margin-bottom:10px">
                         <img src="/uploads/${file}" width="200" style="border-radius:10px;box-shadow:0 0 5px #aaa"/>
                         <p>${file}</p>
                       </div>`
                  )
                  .join("")
          }
        </body>
      </html>`;
    res.send(html);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});