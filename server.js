const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// 📁 Ensure public/uploads folder exists
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🖼️ Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 🧱 Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 📤 Handle photo upload
app.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // ✅ Public URL for the uploaded image
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  console.log("📸 New photo uploaded:", fileUrl);

  res.json({
    message: "Photo uploaded successfully",
    url: fileUrl,
  });
});

// 🏠 Root route
app.get("/", (req, res) => {
  res.send("✅ Quiz Camera AI Server is running!");
});

// 🚀 Start server (Render uses dynamic port)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));