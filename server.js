import express from "express";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// 📸 POST route to receive image from client
app.post("/upload", (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "No image received" });

    // Remove "data:image/png;base64," part
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const fileName = `photo_${Date.now()}.png`;
    const savePath = path.join(__dirname, "uploads");

    // Ensure uploads folder exists
    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);

    // Save image file
    fs.writeFileSync(path.join(savePath, fileName), base64Data, "base64");
    console.log(`✅ Image saved: ${fileName}`);

    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("❌ Error saving image:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});