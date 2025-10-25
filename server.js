import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static("public"));

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});

const upload = multer({ storage });

app.post("/upload", upload.single("photo"), (req, res) => {
  const choice = req.body.choice;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;
  console.log("Received photo for:", choice);
  res.json({ success: true, file: filePath, choice });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
